import sys
import json
from tensorflow import keras
import tensorflow as tf
from pathlib import Path
from django.apps import AppConfig
import pandas as pd
from ml.Equation import Equation


def load_ml_model(path):
    # graph = tf.Graph()
    ml_model = keras.models.load_model(str(path))
    # return graph, ml_model
    return ml_model

class NutritionHelperConfig(AppConfig):
    name = 'nutrition_helper'
    forms_dir = 'nutrition_helper/data/forms/ru'
    ml_models_dir = 'ml/models'
    equations_dir = 'ml/equations'

    def __init__(self, app_name, app_module):
        super().__init__(app_name, app_module)
        self.forms = {}
        self.normalization_info = {}
        self.ml_models = {}
        self.ml_models_info = []

    def load_forms(self):
        for path in Path(self.forms_dir).glob('*'):
            with open(path, 'r', encoding='utf-8') as f:
                self.forms[path.stem] = json.load(f)

    def load_ml_models(self):
        for path in Path(self.ml_models_dir).glob('*'):
            self.normalization_info[path.name] = pd.read_csv('{}/normalization.csv'.format(path), header=0, index_col=0)
            self.ml_models[path.name] = load_ml_model(path)
            with open('{}/info.json'.format(path), 'r', encoding='utf-8') as f:
                self.ml_models_info.append(json.load(f))

    def load_equations(self):
        for path in Path(self.equations_dir).glob('*'):
            self.normalization_info[path.name] = pd.read_csv('{}/normalization.csv'.format(path), header=0, index_col=0)
            self.ml_models[path.name] = pd.read_pickle(str(path) + '/eq.pkl')
            with open('{}/info.json'.format(path), 'r', encoding='utf-8') as f:
                self.ml_models_info.append(json.load(f))

    def ready(self):
        if 'runserver' not in sys.argv:
            return True  # NOT SUITABLE FOR PRODUCTION!!!
        self.load_forms()
        self.load_ml_models()
        self.load_equations()

