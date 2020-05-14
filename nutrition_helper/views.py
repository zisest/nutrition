from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.utils import IntegrityError
from rest_framework.renderers import StaticHTMLRenderer
from django.apps import apps
import pandas as pd
import numpy as np
from ml.Equation import Equation
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import IsAuthenticated

from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import AppUserSerializer, MainUserParamsSerializer, UserPreferencesSerializer
from .models import AppUser, UserParams


ERRORS = {
    'DJ_AUTH-0': 'User with that name already exists',
    'DJ_AUTH-1': 'Could not create user (validation error)',
    'DJ_PARAMS-0': 'Could not save params',
    'DJ_AUTH-0': 'Could not save params (validation error)'

}

# AUTH
@api_view(['POST'])
def auth_create_user(request):
    serializer = AppUserSerializer(data=request.data)
    try:
        if serializer.is_valid():
            user = serializer.save()
            if user:
                json = serializer.data
                return Response(json, status=status.HTTP_201_CREATED)
    except IntegrityError:
        return Response([{'errID': 'DJ_AUTH-0', 'error': ERRORS['DJ_AUTH-0']}], status=status.HTTP_400_BAD_REQUEST)

    serializer_errors = []  # restructuring serializer.errors
    for err_type in serializer.errors.items():
        for err in err_type[1]:
            serializer_errors.append({'errID': 'DJ_AUTH-1', 'error': f'{err_type[0]}: {err}'})
    return Response(serializer_errors, status=status.HTTP_400_BAD_REQUEST)

#

@api_view()
@ensure_csrf_cookie
def index_page(request):
    return render(request, 'index.html')

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
    return Response(output)



@api_view()
@permission_classes([IsAuthenticated])
def api_closed(request):
    return Response('Allowed')

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_user_params(request):
    user = request.user.id
    if request.method == 'GET':
        params = UserParams.objects.filter(user=user)
        if not params:
            return Response(None, status=status.HTTP_204_NO_CONTENT)
        serializer = MainUserParamsSerializer(params[0])
        return Response(serializer.data)
    if request.method == 'POST':
        params = UserParams.objects.filter(user=user)
        if not params:
            serializer = MainUserParamsSerializer(data=request.data)
        else:
            serializer = MainUserParamsSerializer(params[0], data=request.data)
        try:
            if serializer.is_valid():
                user = AppUser.objects.get(pk=user)
                params = serializer.save(user=user)
                if params:
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response([{'errID': 'DJ_PARAMS-0', 'error': ERRORS['DJ_PARAMS-0']}], status=status.HTTP_400_BAD_REQUEST)

        serializer_errors = []  # restructuring serializer.errors
        for err_type in serializer.errors.items():
            for err in err_type[1]:
                serializer_errors.append({'errID': 'DJ_PARAMS-1', 'error': f'{err_type[0]}: {err}'})
        return Response(serializer_errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_user_preferences(request):
    user = request.user.id
    if request.method == 'GET':
        params = UserParams.objects.filter(user=user)
        if not params:
            return Response(None, status=status.HTTP_204_NO_CONTENT)
        serializer = UserPreferencesSerializer(params[0])
        return Response(serializer.data)
    if request.method == 'POST':
        params = UserParams.objects.filter(user=user)
        if not params:
            serializer = UserPreferencesSerializer(data=request.data)
        else:
            serializer = UserPreferencesSerializer(params[0], data=request.data)
        try:
            if serializer.is_valid():
                user = AppUser.objects.get(pk=user)
                params = serializer.save(user=user)
                if params:
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response([{'errID': 'DJ_PARAMS-0', 'error': ERRORS['DJ_PARAMS-0']}],
                            status=status.HTTP_400_BAD_REQUEST)

        serializer_errors = []  # restructuring serializer.errors
        for err_type in serializer.errors.items():
            for err in err_type[1]:
                serializer_errors.append({'errID': 'DJ_PARAMS-1', 'error': f'{err_type[0]}: {err}'})
        return Response(serializer_errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_preferences(request):
    forms = apps.get_app_config('nutrition_helper').forms
    forms = {key: forms[key] for key in ['phys-params-PAL-goal', 'food-preferences']}

    user = request.user.id
    user_params = UserParams.objects.filter(user=user)
    if not user_params:
        return Response(forms)

    params_serializer = MainUserParamsSerializer(user_params[0])
    prefs_serializer = UserPreferencesSerializer(user_params[0])

    params = params_serializer.data
    prefs = prefs_serializer.data

    params_form = []
    for field in forms['phys-params-PAL-goal']:
        params_form.append({**field, 'initialValue': params[field['name']]})
    prefs_form = []
    for field in forms['food-preferences']:
        prefs_form.append({**field, 'initialValue': prefs[field['name']]})


    return Response({'food-preferences': prefs_form, 'phys-params-PAL-goal': params_form})