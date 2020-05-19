from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import AppUser
from .models import UserParams, UserRequirements, UserPreferences, Food, FoodCategory

class AppUserSerializer(serializers.ModelSerializer):
    """
    Currently unused in preference of the below.
    """

    username = serializers.CharField(min_length=4)
    password = serializers.CharField(min_length=8, write_only=True)

    class Meta:
        model = AppUser
        fields = ('username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)  # as long as the fields are the same, we can just use this
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

class MainUserParamsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserParams
        fields = ['age', 'weight', 'height', 'sex', 'goal', 'activity']


class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ['preferences', 'meals']


class UserRequirementsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRequirements
        fields = ['bmr', 'tee', 'energy_requirements', 'proteins', 'fats', 'carbohydrates']


class FoodCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodCategory
        fields = ['name']


class FoodSerializer(serializers.ModelSerializer):
    categories = FoodCategorySerializer(many=True)

    class Meta:
        model = Food
        fields = '__all__'

    def create(self, validated_data):
        categories_data = validated_data.pop('categories')
        food = self.Meta.model(**validated_data)
        food.save()
        for category in categories_data:
            cat = FoodCategory.objects.get(name=category.pop('name'))
            food.categories.add(cat)
        return food


class GetFoodSerializer(serializers.ModelSerializer):  # read only
    categories = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Food
        fields = '__all__'


