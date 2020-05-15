from django.apps import apps
import numpy as np
import pandas as pd

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
        MODEL_NAME = 'MyModel1'

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
        proteins = 22
        fats = 33
        carbohydrates = 44

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
