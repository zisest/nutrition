from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.utils import IntegrityError
from rest_framework.renderers import StaticHTMLRenderer
from django.apps import apps
import pandas as pd
from random import shuffle, sample
import numpy as np
from ml.Equation import Equation
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import AppUserSerializer, MainUserParamsSerializer, UserPreferencesSerializer
from .serializers import UserRequirementsSerializer, FoodSerializer, GetFoodSerializer, FoodCategorySerializer
from .models import AppUser, UserParams, UserRequirements, UserPreferences, Food, FoodCategory

from .calculations import Prediction, Requirements, MealPlan

from django.db.models import Q



ERRORS = {
    'DJ_AUTH-0': 'User with that name already exists',
    'DJ_AUTH-1': 'Could not create user (validation error)',
    'DJ_PARAMS-0': 'Could not save params',
    'DJ_PARAMS-1': 'Could not save params (validation error)',
    'DJ_PREFS-0': 'Could not save preferences',
    'DJ_PREFS-1': 'Could not save preferences (validation error)',
    'DJ_SAVE-PARAMS-0': 'Could not create params and requirements',
    'DJ_SAVE-PARAMS-1': 'Could not create params and requirements (params validation error)',
    'DJ_SAVE-PARAMS-2': 'Could not create params and requirements (requirements validation error)',
    'DJ_SAVE-PARAMS-3': 'Could not update params and requirements',
    'DJ_SAVE-PARAMS-4': 'Could not update params and requirements (params validation error)',
    'DJ_SAVE-PARAMS-5': 'Could not update params and requirements (requirements validation error)',
    'DJ_GET-PLAN-0': 'Please make sure you set your parameters'

}
def PARSE_SERIALIZER_ERRORS(errors, err_id):
    serializer_errors = []  # restructuring serializer.errors
    for err_type in errors.items():
        for err in err_type[1]:
            serializer_errors.append({'errID': err_id, 'error': f'{err_type[0]}: {err}'})
    return serializer_errors

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

    serializer_errors = PARSE_SERIALIZER_ERRORS(serializer.errors, 'DJ_AUTH-1')
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




@api_view(['POST'])
def api_predict(request):
    print(request.data)
    parsed_data, ml_model_name = Prediction.parse_request(request.data)
    result = Prediction.predict(parsed_data, ml_model_name)
    return Response(result)


@api_view()
@permission_classes([IsAuthenticated])
def api_closed(request):
    return Response('Allowed')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_user_params(request):
    user = request.user.id
    # if request.method == 'GET':
    params = UserParams.objects.filter(user=user)
    if not params:
        return Response(None, status=status.HTTP_204_NO_CONTENT)
    serializer = MainUserParamsSerializer(params[0])
    return Response(serializer.data)
    # if request.method == 'POST':
    #     params = UserParams.objects.filter(user=user)
    #     if not params:
    #         serializer = MainUserParamsSerializer(data=request.data)
    #     else:
    #         serializer = MainUserParamsSerializer(params[0], data=request.data)
    #     try:
    #         if serializer.is_valid():
    #             user = AppUser.objects.get(pk=user)
    #             params = serializer.save(user=user)
    #             if params:
    #                 return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     except IntegrityError:
    #         return Response([{'errID': 'DJ_PARAMS-0', 'error': ERRORS['DJ_PARAMS-0']}], status=status.HTTP_400_BAD_REQUEST)
    #
    #     serializer_errors = PARSE_SERIALIZER_ERRORS(serializer.errors, 'DJ_PARAMS-1')
    #     return Response(serializer_errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_user_preferences(request):
    user = request.user.id
    if request.method == 'GET':
        prefs = UserPreferences.objects.filter(user=user)
        if not prefs:
            return Response(None, status=status.HTTP_204_NO_CONTENT)
        serializer = UserPreferencesSerializer(prefs[0])
        return Response(serializer.data)
    if request.method == 'POST':
        prefs = UserPreferences.objects.filter(user=user)
        if not prefs:
            serializer = UserPreferencesSerializer(data=request.data)
        else:
            serializer = UserPreferencesSerializer(prefs[0], data=request.data)
        try:
            if serializer.is_valid():
                user = AppUser.objects.get(pk=user)
                prefs = serializer.save(user=user)
                if prefs:
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response([{'errID': 'DJ_PREFS-0', 'error': ERRORS['DJ_PREFS-0']}],
                            status=status.HTTP_400_BAD_REQUEST)

        serializer_errors = PARSE_SERIALIZER_ERRORS(serializer.errors, 'DJ_PREFS-1')
        return Response(serializer_errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_preferences_page(request):
    forms = apps.get_app_config('nutrition_helper').forms
    forms = {key: forms[key] for key in ['phys-params-PAL-goal', 'food-preferences', 'energy', 'nutrients']}

    user = request.user.id
    user_params = UserParams.objects.filter(user=user)
    user_preferences = UserPreferences.objects.filter(user=user)
    user_requirements = UserRequirements.objects.filter(user=user)

    response = forms
    status = []
    if user_params:
        status.append('phys-params-PAL-goal')
        params_serializer = MainUserParamsSerializer(user_params[0])
        params = params_serializer.data
        params_form = [{**field, 'initialValue': params[field['name']]} for field in forms['phys-params-PAL-goal']]
        response['phys-params-PAL-goal'] = params_form

    if user_preferences:
        status.append('food-preferences')
        prefs_serializer = UserPreferencesSerializer(user_preferences[0])
        prefs = prefs_serializer.data
        prefs_form = [{**field, 'initialValue': prefs[field['name']]} for field in forms['food-preferences']]
        response['food-preferences'] = prefs_form

    if user_requirements:
        status.extend(['energy', 'nutrients'])
        reqs_serializer = UserRequirementsSerializer(user_requirements[0])
        reqs = reqs_serializer.data
        energy = [{**field, 'value': reqs[field['name']]} for field in forms['energy']]
        nutrients = [{**field, 'value': reqs[field['name']]} for field in forms['nutrients']]
        response['energy'] = energy
        response['nutrients'] = nutrients

    return Response({'data': response, 'status': status})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_user_requirements(request):
    user = request.user.id
    params = UserRequirements.objects.filter(user=user)
    if not params:
        return Response(None, status=status.HTTP_204_NO_CONTENT)
    serializer = UserRequirementsSerializer(params[0])
    return Response(serializer.data)


# saves params => recalculates BMR, TEE, energy_reqs, macronutrients => returns
# { data: { params, requirements } }
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_save_user_params(request):
    user = request.user
    params = UserParams.objects.filter(user=user.id)
    requirements = UserRequirements.objects.filter(user=user.id)

    if not params:
        params_serializer = MainUserParamsSerializer(data=request.data)
        try:
            if params_serializer.is_valid():
                params_data = dict(params_serializer.validated_data)
                requirements_data = Requirements.calc_all_diffs(['bmr'], params_data)

                requirements_serializer = UserRequirementsSerializer(data=requirements_data)
                if requirements_serializer.is_valid():
                    requirements = requirements_serializer.save(user=user)
                    params = params_serializer.save(user=user)
                    if requirements and params:
                        return Response({'data': {'parameters': params_serializer.data, 'requirements': requirements_serializer.data}},
                                        status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response([{'errID': 'DJ_SAVE-PARAMS-0', 'error': ERRORS['DJ_SAVE-PARAMS-0']}],
                            status=status.HTTP_400_BAD_REQUEST)

        params_serializer_errors = PARSE_SERIALIZER_ERRORS(params_serializer.errors, 'DJ_SAVE-PARAMS-1')
        reqs_serializer_errors = []
        if 'requirements_serializer' in locals():
            reqs_serializer_errors = PARSE_SERIALIZER_ERRORS(requirements_serializer.errors, 'DJ_SAVE-PARAMS-2')

        return Response(params_serializer_errors + reqs_serializer_errors, status=status.HTTP_400_BAD_REQUEST)

    elif requirements:  # assuming if there are params, there are requirements
        params_serializer = MainUserParamsSerializer(params[0], data=request.data)
        old_params_serializer = MainUserParamsSerializer(params[0])
        old_requirements_serializer = UserRequirementsSerializer(requirements[0])

        old_requirements = old_requirements_serializer.data
        try:
            if params_serializer.is_valid():
                old_params = old_params_serializer.data
                new_params = dict(params_serializer.validated_data)
                diffs = Requirements.should_recalc(old_params, new_params)
                if not diffs:
                    return Response({'data': {'parameters': old_params, 'requirements': old_requirements}}, status=status.HTTP_200_OK)
                new_requirements = Requirements.calc_all_diffs(diffs, new_params, old_requirements)

                requirements_serializer = UserRequirementsSerializer(requirements[0], data=new_requirements)
                if requirements_serializer.is_valid():
                    requirements = requirements_serializer.save(user=user)
                    params = params_serializer.save(user=user)
                    if params and requirements:
                        return Response({'data': {'parameters': params_serializer.data, 'requirements': requirements_serializer.data}},
                                        status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response([{'errID': 'DJ_SAVE-PARAMS-3', 'error': ERRORS['DJ_SAVE-PARAMS-3']}], status=status.HTTP_400_BAD_REQUEST)

        params_serializer_errors = PARSE_SERIALIZER_ERRORS(params_serializer.errors, 'DJ_SAVE-PARAMS-4')
        reqs_serializer_errors = []
        if 'requirements_serializer' in locals():
            reqs_serializer_errors = PARSE_SERIALIZER_ERRORS(requirements_serializer.errors, 'DJ_SAVE-PARAMS-5')

        return Response(params_serializer_errors + reqs_serializer_errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def api_dev_add_food_categories(request):
    # request.data=['halal','meal']
    data = [{"name": category} for category in request.data]
    serializer = FoodCategorySerializer(data=data, many=True)
    if serializer.is_valid():
        categories = serializer.save()
        if categories:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response('Something went wrong')


@api_view(['POST'])
@permission_classes([IsAdminUser])
def api_dev_add_foods(request):
    serializer = FoodSerializer(data=request.data, many=True)
    if serializer.is_valid():
        print('add foods: valid')
        categories = serializer.save()
        if categories:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response('Could not write')
    return Response('Not valid')


@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_dev_get_foods(request):
    requested_amount = int(request.query_params.get('amount', '5'))
    return Response(GetFoodSerializer(Food.objects.all()[:requested_amount], many=True).data)





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_meal_plan(request):
    user = request.user
    preferences = UserPreferences.objects.filter(user=user.id)
    requirements = UserRequirements.objects.filter(user=user.id)
    if not requirements:
        return Response(ERRORS['DJ_GET-PLAN-0'])
    requirements = requirements[0]

    if not preferences:
        filtered_by_prefs = Food.objects.all()
        no_of_meals = 3
    else:
        preferences = preferences[0]
        filtered_by_prefs = MealPlan.and_filter(Food.objects.all(), 'categories__name', preferences.preferences)
        no_of_meals = preferences.meals
        # breakfast = MealPlan.select_breakfast(filtered_by_prefs)

    res = MealPlan.calc_meal_plan_alt(filtered_by_prefs, requirements, no_of_meals)
    print(res[-2])
    return Response({'plan': res[-2], 'size': res[-1]})

