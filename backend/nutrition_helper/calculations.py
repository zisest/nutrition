# from .serializers import GetFoodSerializer

from django.apps import apps
import numpy as np
import pandas as pd
import math

from random import sample
import pulp as p
from operator import itemgetter


class Prediction:
    @classmethod
    def parse_request(cls, data):
        ml_model_name = data['MODEL_NAME']
        ml_model_info = next((item for item in apps.get_app_config('nutrition_helper').ml_models_info if
                              item['MODEL_NAME'] == ml_model_name), False)
        if not ml_model_info:
            return False
        parsed_dict = {}
        for field in ml_model_info['SOURCE_FIELDS']:
            if field['NAME'] not in data.keys():
                return False
            if field['CATEGORIAL']:
                for val in field['VALUES']:
                    parsed_dict[field['NAME'] + '_' + val['NAME']] = float(data[field['NAME']] == val['NAME'])
            else:
                parsed_dict[field['NAME']] = float(data[field['NAME']])
        parsed = list(parsed_dict.values())
        return parsed, ml_model_name

    @classmethod
    def norm(cls, x, normalization):
        return (x - normalization['mean']) / normalization['std']

    @classmethod
    def sigmoid(cls, x):
        return 1 / (1 + math.exp(-x))

    @classmethod
    def count_nn_layer(cls, input, weights, biases, activate=True):
        input = input.reshape(input.shape[0], -1)
        iw = input * weights
        iw = np.sum(iw, axis=0) + biases
        if activate:
            res = np.array([cls.sigmoid(xi) for xi in iw])
        else:
            res = iw
        return res

    @classmethod
    def predict_w(cls, normed_data, ml_model_name):

        weights = apps.get_app_config('nutrition_helper').ml_models[ml_model_name]

        input = np.array(normed_data)
        for i in range(int(len(weights)/2)):
            if i == int(len(weights)/2-1):
                output = cls.count_nn_layer(input, weights[2*i], weights[2*i+1], activate=False)[0]
            else:
                input = cls.count_nn_layer(input, weights[2 * i], weights[2 * i + 1])

        return output

    @classmethod
    def predict(cls, parsed_data, ml_model_name):
        print(parsed_data)
        print(ml_model_name)
        if not parsed_data:
            return str('ERROR')  # CHANGE

        normalized = cls.norm(parsed_data, apps.get_app_config('nutrition_helper').normalization_info[ml_model_name])

        ml_model = apps.get_app_config('nutrition_helper').ml_models[ml_model_name]
        ml_model_info = next((item for item in apps.get_app_config('nutrition_helper').ml_models_info if
                              item['MODEL_NAME'] == ml_model_name), None)

        if ml_model_info['TYPE'] == 'equation':
            prediction = ml_model.predict(pd.DataFrame(normalized).transpose())
            output = np.array(prediction).flatten()[0]
        else:
            output = cls.predict_w(normalized, ml_model_name)
        print(output)
        return output


class Requirements:

    @classmethod
    def should_recalc(cls, old_params, new_params):
        if old_params == new_params:
            return []

        FIELDS = ['age', 'weight', 'height', 'sex']
        if {key: old_params[key] for key in FIELDS} != {key: new_params[key] for key in FIELDS}:
            return ['bmr', 'tee', 'energy_requirements', 'macronutirents']

        if old_params['activity'] != new_params['activity']:
            return ['tee', 'energy_requirements', 'macronutirents']

        if old_params['goal'] != new_params['goal']:
            return ['energy_requirements', 'macronutirents']

    @classmethod
    def calc_BMR(cls, params):
        FIELDS = ['age', 'weight', 'height', 'sex']
        MODEL_NAME = 'nn'

        data = {key: params[key] for key in FIELDS if params[key] is not None}
        data['MODEL_NAME'] = MODEL_NAME
        if len(data) != 5:
            return None
        parsed_data, ml_model_name = Prediction.parse_request(data)
        bmr = round(Prediction.predict(parsed_data, ml_model_name), 3)
        return bmr

    @classmethod
    def calc_TEE_reqs(cls, params, bmr):
        bmr = float(bmr)
        PALs = {
            'sedentary': 1.55,
            'moderate': 1.75,
            'active': 2,
            'high': 2.25
        }

        if 'activity' not in params or bmr is None:
            return None

        pal = PALs[params['activity']]
        tee = round(bmr * pal, 3)

        return tee

    @classmethod
    def calc_en_reqs(cls, params, tee):
        tee = float(tee)
        GOALS = {
            'lose': 0.8,
            'maintain': 1,
            'gain': 1.2
        }

        if 'goal' not in params or tee is None:
            return None

        goal_coef = GOALS[params['goal']]
        energy_requirements = round(tee * goal_coef, 3)

        return energy_requirements

    @classmethod
    def calc_macronutrients(cls, params, energy_requirements):
        energy_requirements = float(energy_requirements)
        proteins = round(energy_requirements * 0.20 / 0.017)  # 10-35
        fats = round(energy_requirements * 0.25 / 0.037)  # 20-35
        carbohydrates = round(energy_requirements * 0.55 / 0.017)  # 45-65

        return proteins, fats, carbohydrates

    @classmethod
    def calc_all_diffs(cls, diffs, params, old_requirements=None):
        if not diffs:
            return None
        elif 'bmr' in diffs:
            bmr = Requirements.calc_BMR(params)
            tee = Requirements.calc_TEE_reqs(params, bmr)
            energy_requirements = Requirements.calc_en_reqs(params, tee)
            proteins, fats, carbohydrates = Requirements.calc_macronutrients(params, energy_requirements)
        elif 'tee' in diffs:
            bmr = old_requirements['bmr']
            tee = Requirements.calc_TEE_reqs(params, bmr)
            energy_requirements = Requirements.calc_en_reqs(params, tee)
            proteins, fats, carbohydrates = Requirements.calc_macronutrients(params, energy_requirements)
        elif 'energy_requirements' in diffs:
            bmr = old_requirements['bmr']
            tee = old_requirements['tee']
            energy_requirements = Requirements.calc_en_reqs(params, tee)
            proteins, fats, carbohydrates = Requirements.calc_macronutrients(params, energy_requirements)
        return {
            'bmr': bmr,
            'tee': tee,
            'energy_requirements': energy_requirements,
            'proteins': proteins,
            'fats': fats,
            'carbohydrates': carbohydrates
        }


class CalcMealPlan:

    @classmethod
    def and_filter(cls, queryset, field, values):
        for value in values:
            if value[0] == '!':
                queryset = queryset.exclude(**{field: value[1:]})
            else:
                queryset = queryset.filter(**{field: value})
        return queryset

    @classmethod
    def select_breakfast(cls, queryset, size=4):
        breakfast = queryset.filter(categories__name='breakfast')
        meals = cls.and_filter(breakfast, 'categories__name', ['meal', '!drink'])
        sides = breakfast.filter(categories__name='side')
        drinks = breakfast.filter(categories__name='drink')

        return sample(list(meals), 1) + sample(list(sides), 2) + sample(list(drinks), 1)



    @classmethod
    def calc_food(cls, food, value):
        NAN_FIELDS = ['name', 'categories', 'source_categories']
        food_data = food
        # food_serializer = GetFoodSerializer(food)
        # food_data = food_serializer.data
        res = {key: val * value for key, val in food_data.items() if key not in NAN_FIELDS and val is not None}
        food_data.update(res)
        return food_data

    @classmethod
    def calc_food_energy(cls, food, value):
        energy = food.energy * value
        return {'food': food.pk, 'energy': energy, 'portion_size': value}

    @classmethod
    def sort_foods(cls, foods, no_of_meals):
        foods = sorted(foods, key=itemgetter('energy'))
        # meals = [[] for i in range(no_of_meals)]
        meals = []
        meal_sizes = [0] * no_of_meals
        meals_energy = [0] * no_of_meals
        while foods:
            food_data = foods.pop()
            sorted_by_energy = np.argsort(meals_energy)
            smallest_bin = None
            for i in sorted_by_energy:
                if smallest_bin is None and meal_sizes[i] < 4:
                    smallest_bin = i
            # meals[smallest_bin].append(food_data)
            if smallest_bin is not None:
                meal_sizes[smallest_bin] += 1
                meals_energy[smallest_bin] += food_data['energy']
                food_data['meal_no'] = smallest_bin + 1
                meals.append(food_data)
        # meal_plan = [food for meal in meals for food in meal]
        return meals  # meal_plan

    @classmethod
    def calc_meal_plan(cls, queryset, requirements, no_of_meals=3):
        TOTAL_ENERGY_REQ = float(requirements.energy_requirements)*238.8458966
        FAT_BOUNDS = (requirements.fats*0.9, requirements.fats*1.1)
        CARBS_BOUNDS = (requirements.carbohydrates*0.9, requirements.carbohydrates*1.1)
        PROTEIN_BOUNDS = (requirements.proteins*0.9, requirements.proteins*1.1)
        MAX_WEIGHT = 30
        MAX_FOOD_WEIGHT = 5
        MIN_FOOD_WEIGHT = 0.5
        DRINK_PORTION = 2

        TOTAL_PORTIONS = no_of_meals*4
        TOTAL_MEALS = no_of_meals

        PERCENTAGE = 0.7

        breakfast_foods = queryset.filter(categories__name='breakfast')
        breakfast_meals = list(cls.and_filter(breakfast_foods, 'categories__name', ['!side', '!drink', '!dessert']))
        breakfast_sides = list(breakfast_foods.filter(categories__name='side'))
        breakfast_drinks = list(breakfast_foods.filter(categories__name='drink'))

        dinner_foods = queryset.filter(categories__name='dinner')
        dinner_meals = list(cls.and_filter(dinner_foods, 'categories__name', ['!side', '!drink', '!dessert']))
        dinner_sides = list(dinner_foods.filter(categories__name='side'))
        dinner_drinks = list(dinner_foods.filter(categories__name='drink'))

        breakfast = {
            'meals': sample(breakfast_meals, round(len(breakfast_meals) * PERCENTAGE)),
            'sides': sample(breakfast_sides, round(len(breakfast_sides) * PERCENTAGE)),
            'drinks': sample(breakfast_drinks, round(len(breakfast_drinks) * PERCENTAGE))
        }
        dinner = {
            'meals': sample(dinner_meals, round(len(dinner_meals) * PERCENTAGE)),
            'sides': sample(dinner_sides, round(len(dinner_sides) * PERCENTAGE)),
            'drinks': sample(dinner_drinks, round(len(dinner_drinks) * PERCENTAGE))
        }

        foods = set([food for food_type in breakfast.values() for food in food_type]
                    + [food for food_type in dinner.values() for food in food_type])
        food_ids = [food.id for food in foods]

        breakfast_ids = {food_type: [food.id for food in foods] for food_type, foods in breakfast.items()}
        dinner_ids = {food_type: [food.id for food in foods] for food_type, foods in dinner.items()}

        calories = dict(zip(food_ids, [food.energy for food in foods]))
        fats = dict(zip(food_ids, [food.fat for food in foods]))
        carbs = dict(zip(food_ids, [food.carbohydrate for food in foods]))
        proteins = dict(zip(food_ids, [food.protein for food in foods]))

        #MDS
        mds = dict(zip(food_ids, [food.mds for food in foods]))
        #

        problem = p.LpProblem("Meal_plan", p.LpMinimize)
        food_vars = p.LpVariable.dicts("Food", food_ids, lowBound=0, cat='Continuous')
        food_choices = p.LpVariable.dicts("Chosen", food_ids, 0, 1, cat='Integer')

        problem += p.lpSum([calories[f] * food_vars[f] for f in food_ids]) - TOTAL_ENERGY_REQ

        problem += p.lpSum([calories[f] * food_vars[f] for f in food_ids]) - TOTAL_ENERGY_REQ >= 0, "Objective >= 0"

        problem += p.lpSum([fats[f] * food_vars[f] for f in food_ids]) >= FAT_BOUNDS[0], "Total fat min"
        problem += p.lpSum([fats[f] * food_vars[f] for f in food_ids]) <= FAT_BOUNDS[1], "Total fat max"
        problem += p.lpSum([carbs[f] * food_vars[f] for f in food_ids]) >= CARBS_BOUNDS[0], "Total carbs min"
        problem += p.lpSum([carbs[f] * food_vars[f] for f in food_ids]) <= CARBS_BOUNDS[1], "Total carbs max"
        problem += p.lpSum([proteins[f] * food_vars[f] for f in food_ids]) >= PROTEIN_BOUNDS[0], "Total protein min"
        problem += p.lpSum([proteins[f] * food_vars[f] for f in food_ids]) <= PROTEIN_BOUNDS[1], "Total protein max"
        # mono- and disacharides
        problem += p.lpSum([mds[f] * food_vars[f] for f in food_ids]) <= 100, "MDS"
        #

        problem += p.lpSum([food_vars[f] for f in food_ids]) <= MAX_WEIGHT, "00_3"

        # giving weight to lp variables only when choice == 1
        for f in food_ids:
            if f in breakfast_ids['drinks'] or f in dinner_ids['drinks']:
                problem += food_vars[f] == food_choices[f] * DRINK_PORTION
            else:
                problem += food_vars[f] >= food_choices[f] * MIN_FOOD_WEIGHT
                problem += food_vars[f] <= food_choices[f] * MAX_FOOD_WEIGHT

        problem += p.lpSum([food_choices[f] for f in food_ids]) == TOTAL_PORTIONS, "Selecting 12 foods"

        problem.solve()
        problem_results = [{var.name: var.varValue} for var in problem.variables() if
                           var.varValue > 0 and 'Food' in var.name]

        meal_plan = []
        for food in problem_results:
            res = list(food.items())[0]
            food_id = int(res[0].split('_')[1])
            food_obj = next(f for f in foods if f.id == food_id)
            meal_plan.append(cls.calc_food_energy(food_obj, res[1]))

        meal_plan = cls.sort_foods(meal_plan, TOTAL_MEALS)

        return [p.LpStatus[problem.status], p.value(problem.objective) + TOTAL_ENERGY_REQ, problem_results, meal_plan, TOTAL_MEALS]
