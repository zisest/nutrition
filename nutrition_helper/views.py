from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.apps import apps
import json

# Create your views here.
def api_get_forms(request):
    requested_forms = request.GET.get('forms', 'all')
    forms = apps.get_app_config('nutrition_helper').forms
    if requested_forms == 'all':
        return JsonResponse(forms)
    requested_forms = requested_forms.split(',')
    forms = {key: forms[key] for key in requested_forms}
    return JsonResponse(forms)


def query_test(request):
    res = request.GET.get('bs', '')
    return HttpResponse(res)