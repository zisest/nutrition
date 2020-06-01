from .serializers import GetFoodSerializer

from django.apps import apps
import numpy as np
import pandas as pd

from random import sample
import pulp as p


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
    def predict(cls, parsed_data, ml_model_name):
        print(parsed_data)
        print(ml_model_name)
        if not parsed_data:
            return str('ERROR')  # CHANGE
        normalized = cls.norm(parsed_data, apps.get_app_config('nutrition_helper').normalization_info[ml_model_name])

        # if the model is created in non eager mode
        # graph, ml_model = apps.get_app_config('nutrition_helper').ml_models[ml_model_name]
        # with graph.as_default():
        #     prediction = ml_model.predict(pd.DataFrame(normalized).transpose())

        ml_model = apps.get_app_config('nutrition_helper').ml_models[ml_model_name]
        prediction = ml_model.predict(pd.DataFrame(normalized).transpose())

        output = np.array(prediction).flatten()[0]
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


class MealPlan:

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
    def calc_meal_plan(cls, queryset, size=3):
        TOTAL_ENERGY_REQ = 2500
        FAT_BOUNDS = (40, 60)
        CARBS_BOUNDS = (140, 220)
        PROTEIN_BOUNDS = (60, 120)

        breakfast_foods = queryset.filter(categories__name='breakfast')
        breakfast_meals = list(cls.and_filter(breakfast_foods, 'categories__name', ['meal', '!drink']))
        breakfast_sides = list(breakfast_foods.filter(categories__name='side'))
        breakfast_drinks = list(breakfast_foods.filter(categories__name='drink'))

        dinner_foods = queryset.filter(categories__name='dinner')
        dinner_meals = list(cls.and_filter(dinner_foods, 'categories__name', ['meal', '!drink']))
        dinner_sides = list(dinner_foods.filter(categories__name='side'))
        dinner_drinks = list(dinner_foods.filter(categories__name='drink'))

        selected_dinner_meals = sample(dinner_meals, 2)
        selected_dinner_sides = sample(dinner_sides, 4)
        selected_dinner_drinks = sample(dinner_drinks, 2)

        meal1 = sample(breakfast_meals, 1) + sample(breakfast_sides, 2) + sample(breakfast_drinks, 1)
        meal2 = selected_dinner_meals[:1] + selected_dinner_sides[:2] + selected_dinner_drinks[:1]
        meal3 = selected_dinner_meals[1:] + selected_dinner_sides[2:] + selected_dinner_drinks[1:]

        all_foods = meal1 + meal2 + meal3

        food_names = [food.name for food in all_foods]
        calories = dict(zip(food_names, [food.energy for food in all_foods]))
        fats = dict(zip(food_names, [food.fat for food in all_foods]))
        carbs = dict(zip(food_names, [food.carbohydrate for food in all_foods]))
        proteins = dict(zip(food_names, [food.protein for food in all_foods]))

        problem = p.LpProblem("Meal_plan", p.LpMinimize)
        food_vars = p.LpVariable.dicts("Food", food_names, lowBound=0, cat='Continuous')

        problem += p.lpSum([calories[f] * food_vars[f] for f in food_names]) - TOTAL_ENERGY_REQ

        problem += p.lpSum([calories[f] * food_vars[f] for f in food_names]) - TOTAL_ENERGY_REQ >= -50, "Objective >= 0"

        problem += p.lpSum([fats[f] * food_vars[f] for f in food_names]) >= FAT_BOUNDS[0], "Total fat min"
        problem += p.lpSum([fats[f] * food_vars[f] for f in food_names]) <= FAT_BOUNDS[1], "Total fat max"
        problem += p.lpSum([carbs[f] * food_vars[f] for f in food_names]) >= CARBS_BOUNDS[0], "Total carbs min"
        problem += p.lpSum([carbs[f] * food_vars[f] for f in food_names]) <= CARBS_BOUNDS[1], "Total carbs max"
        problem += p.lpSum([proteins[f] * food_vars[f] for f in food_names]) >= PROTEIN_BOUNDS[0], "Total protein min"
        problem += p.lpSum([proteins[f] * food_vars[f] for f in food_names]) <= PROTEIN_BOUNDS[1], "Total protein max"

        # if size == 3:
        #     for i in range(0, 3):
        #         problem += p.lpSum([fats[f] * food_vars[f] for f in food_names[4*i:4*i+4]]) \
        #                    >= FAT_BOUNDS[0] / 3, f"Meal {i+1} fat min"
        #         problem += p.lpSum([fats[f] * food_vars[f] for f in food_names[4*i:4*i+4]]) \
        #                    <= FAT_BOUNDS[1] / 3,  f"Meal {i+1} fat max"
        #         problem += p.lpSum([carbs[f] * food_vars[f] for f in food_names[4*i:4*i+4]]) \
        #                    >= CARBS_BOUNDS[0] / 3,  f"Meal {i+1} carbs min"
        #         problem += p.lpSum([carbs[f] * food_vars[f] for f in food_names[4*i:4*i+4]]) \
        #                    <= CARBS_BOUNDS[1] / 3,  f"Meal {i+1} carbs max"
        #         problem += p.lpSum([proteins[f] * food_vars[f] for f in food_names[4*i:4*i+4]]) \
        #                    >= PROTEIN_BOUNDS[0] / 3,  f"Meal {i+1} protein min"
        #         problem += p.lpSum([proteins[f] * food_vars[f] for f in food_names[4*i:4*i+4]]) \
        #                    <= PROTEIN_BOUNDS[1] / 3,  f"Meal {i+1} protein max"
        #
        #         problem += food_vars[food_names[(i+1)*4-1]] == 2

        problem.solve()
        return [p.LpStatus[problem.status], p.value(problem.objective),
                [{var.name: var.varValue} for var in problem.variables()]]

    @classmethod
    def calc_food(cls, food, value):
        NAN_FIELDS = ['name', 'categories', 'source_categories']

        food_serializer = GetFoodSerializer(food)
        food_data = food_serializer.data
        res = {key: val * value for key, val in food_data.items() if key not in NAN_FIELDS and val is not None}
        food_data.update(res)
        return food_data

    @classmethod
    def calc_meal_plan_alt(cls, queryset):
        TOTAL_ENERGY_REQ = 2650
        FAT_BOUNDS = (65, 95)
        CARBS_BOUNDS = (320, 400)
        PROTEIN_BOUNDS = (100, 150)
        MAX_WEIGHT = 20
        MAX_FOOD_WEIGHT = 5
        MIN_FOOD_WEIGHT = 0.5
        DRINK_PORTION = 2

        TOTAL_PORTIONS = 12
        TOTAL_MEALS = 3

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
        food_names = [food.name for food in foods]

        breakfast_names = {food_type: [food.name for food in foods] for food_type, foods in breakfast.items()}
        dinner_names = {food_type: [food.name for food in foods] for food_type, foods in dinner.items()}

        calories = dict(zip(food_names, [food.energy for food in foods]))
        fats = dict(zip(food_names, [food.fat for food in foods]))
        carbs = dict(zip(food_names, [food.carbohydrate for food in foods]))
        proteins = dict(zip(food_names, [food.protein for food in foods]))

        #MDS
        mds = dict(zip(food_names, [food.mds for food in foods]))
        #

        problem = p.LpProblem("Meal_plan", p.LpMinimize)
        food_vars = p.LpVariable.dicts("Food", food_names, lowBound=0, cat='Continuous')
        food_choices = p.LpVariable.dicts("Chosen", food_names, 0, 1, cat='Integer')

        problem += p.lpSum([calories[f] * food_vars[f] for f in food_names]) - TOTAL_ENERGY_REQ

        problem += p.lpSum([calories[f] * food_vars[f] for f in food_names]) - TOTAL_ENERGY_REQ >= 0, "Objective >= 0"

        problem += p.lpSum([fats[f] * food_vars[f] for f in food_names]) >= FAT_BOUNDS[0], "Total fat min"
        problem += p.lpSum([fats[f] * food_vars[f] for f in food_names]) <= FAT_BOUNDS[1], "Total fat max"
        problem += p.lpSum([carbs[f] * food_vars[f] for f in food_names]) >= CARBS_BOUNDS[0], "Total carbs min"
        problem += p.lpSum([carbs[f] * food_vars[f] for f in food_names]) <= CARBS_BOUNDS[1], "Total carbs max"
        problem += p.lpSum([proteins[f] * food_vars[f] for f in food_names]) >= PROTEIN_BOUNDS[0], "Total protein min"
        problem += p.lpSum([proteins[f] * food_vars[f] for f in food_names]) <= PROTEIN_BOUNDS[1], "Total protein max"
        # mono- and disacharides
        problem += p.lpSum([mds[f] * food_vars[f] for f in food_names]) <= 100, "MDS"
        #

        problem += p.lpSum([food_vars[f] for f in food_names]) <= MAX_WEIGHT, "00_3"

        # giving weight to lp variables only when choice == 1
        for f in food_names:
            if f in breakfast_names['drinks'] or f in dinner_names['drinks']:
                problem += food_vars[f] == food_choices[f] * DRINK_PORTION
            else:
                problem += food_vars[f] >= food_choices[f] * MIN_FOOD_WEIGHT
                problem += food_vars[f] <= food_choices[f] * MAX_FOOD_WEIGHT

        problem += p.lpSum([food_choices[f] for f in food_names]) == TOTAL_PORTIONS, "Selecting 12 foods"
        problem += p.lpSum([food_choices[f] for f in breakfast_names['meals']]) == 1, "4"
        problem += p.lpSum([food_choices[f] for f in breakfast_names['sides']]) == 2, "5"
        problem += p.lpSum([food_choices[f] for f in breakfast_names['drinks']]) == 1, "6"
        problem += p.lpSum([food_choices[f] for f in dinner_names['meals']]) == 2, "7"
        problem += p.lpSum([food_choices[f] for f in dinner_names['sides']]) == 4, "8"
        problem += p.lpSum([food_choices[f] for f in dinner_names['drinks']]) == 2, "9"

        problem.solve()
        problem_results = [{var.name: var.varValue} for var in problem.variables() if
                           var.varValue > 0 and 'Food' in var.name]

        meal_plan = []
        for food in problem_results:
            res = list(food.items())[0]

            food_name = ' '.join(res[0].split('_')[1:])
            contains_recipe_num = food_name[-1].isdigit()
            if contains_recipe_num:
                food_name = ' '.join(food_name.split(' ')[:-1]) + '-' + food_name.split(' ')[-1]
            food_obj = next(f for f in foods if f.name == food_name)
            meal_plan.append(cls.calc_food(food_obj, res[1]))

        return [p.LpStatus[problem.status], p.value(problem.objective) + TOTAL_ENERGY_REQ, problem_results, meal_plan, TOTAL_MEALS]
