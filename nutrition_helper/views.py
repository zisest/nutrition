from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.renderers import StaticHTMLRenderer
from django.apps import apps
import json
import pandas as pd
import numpy as np
from ml.Equation import Equation
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie


# Create your views here.
@api_view()
@ensure_csrf_cookie
def index_page(request):
    return render(request, 'build/index.html')

@api_view()
def api_get_forms(request):
    requested_forms = request.query_params.get('forms', 'all')
    forms = apps.get_app_config('nutrition_helper').forms
    if requested_forms == 'all':
        return Response(forms)
    requested_forms = requested_forms.split(',')
    forms = {key: forms[key] for key in requested_forms}
    return Response(forms)

@api_view()
def api_get_models(request):
    ml_models = apps.get_app_config('nutrition_helper').ml_models_info
    return Response(ml_models)



def parse_request(data):
    ml_model_name = data['MODEL_NAME']
    ml_model_info = next((item for item in apps.get_app_config('nutrition_helper').ml_models_info if item['MODEL_NAME'] == ml_model_name), False)
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


def norm(x, normalization):
    return (x - normalization['mean']) / normalization['std']


@api_view(['POST'])
def api_predict(request):
    data = request.data
    print(data)
    parsed, ml_model_name = parse_request(data)
    print(parsed)
    if not parsed:
        return str('ERROR') # CHANGE
    normalized = norm(parsed, apps.get_app_config('nutrition_helper').normalization_info[ml_model_name])
    # if the model is created in non eager mode
    # graph, ml_model = apps.get_app_config('nutrition_helper').ml_models[ml_model_name]
    # with graph.as_default():
    #     prediction = ml_model.predict(pd.DataFrame(normalized).transpose())

    ml_model = apps.get_app_config('nutrition_helper').ml_models[ml_model_name]
    prediction = ml_model.predict(pd.DataFrame(normalized).transpose())

    output = np.array(prediction).flatten()[0]
    print(output)
    return Response(str(output))



@api_view(['POST'])
def api_test_post(request):
    data = request.data
    return Response(data)