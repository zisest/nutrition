import sys
import json
from tensorflow import keras
from pathlib import Path
from django.apps import AppConfig
import pandas as pd

class NutritionHelperConfig(AppConfig):
    name = 'nutrition_helper'
    forms_dir = 'nutrition_helper/data/forms'
    ml_models_dir = 'nutrition_helper/data/models'

    def __init__(self, app_name, app_module):
        super().__init__(app_name, app_module)
        self.forms = {}
        self.normalization_info = {}
        self.models = {}
        self.models_info = []

    def load_forms(self):
        for path in Path(self.forms_dir).glob('*'):
            with open(path, 'r', encoding='utf-8') as f:
                self.forms[path.stem] = json.load(f)

    def load_ml_models(self):
        for path in Path(self.ml_models_dir).glob('*'):
            self.normalization_info[path.name] = pd.read_csv('{}/normalization.csv'.format(path), header=0, index_col=0)
            self.models[path.name] = keras.models.load_model(str(path))
            with open('{}/info.json'.format(path), 'r', encoding='utf-8') as f:
                self.models_info.append(json.load(f))

    def ready(self):
        if 'runserver' not in sys.argv:
            return True  # NOT SUITABLE FOR PRODUCTION!!!
        self.load_forms()
        self.load_ml_models()

