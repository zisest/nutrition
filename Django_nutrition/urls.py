"""Django_nutrition URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from nutrition_helper import views
from rest_framework_simplejwt import views as jwt_views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),

    path('api/dev/add_food_categories/', views.api_dev_add_food_categories),
    path('api/dev/add_foods/', views.api_dev_add_foods),
    path('api/dev/get_foods/', views.api_dev_get_foods),

    path('api/get_forms/', views.api_get_forms),
    path('api/get_models/', views.api_get_models),
    path('api/predict/', views.api_predict),

    path('api/closed/', views.api_closed),

    path('api/auth/get_token/', jwt_views.TokenObtainPairView.as_view(), name='token_create'),
    path('api/auth/refresh_token/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/create/', views.auth_create_user, name='create_user'),

    path('api/save_user_params/', views.api_save_user_params),
    path('api/get_user_params/', views.api_get_user_params),
    path('api/get_user_requirements/', views.api_get_user_requirements),
    path('api/user_preferences/', views.api_user_preferences),

    path('api/get_preferences_page/', views.api_get_preferences_page),
    # re_path(r'^.*$', views.index_page),
]
