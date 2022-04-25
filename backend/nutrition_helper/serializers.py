from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import AppUser
from .models import UserParams, UserRequirements, UserPreferences, Food, FoodCategory, MealPlan, Portions
from .calculations import CalcMealPlan

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
        exclude = ['id']


class PortionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portions
        fields = ['portion_size', 'food', 'meal_no']


class GetPortionsSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        food_data = GetFoodSerializer(instance.food).data
        food = CalcMealPlan.calc_food(food_data, instance.portion_size)
        return {'food': food, 'meal_no': instance.meal_no}


class GetMealPlanSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        portions = Portions.objects.filter(meal_plan_id=instance.id)
        portions_data = GetPortionsSerializer(portions, many=True)

        return {'portions': portions_data.data, 'size': instance.size}


class MealPlanSerializer(serializers.ModelSerializer):
    portions = PortionsSerializer(many=True)

    class Meta:
        model = MealPlan
        fields = ['size', 'portions']

    def create(self, validated_data):
        portions_data = validated_data.pop('portions')
        meal_plan = self.Meta.model(**validated_data)
        meal_plan.save()
        for portion_data in portions_data:
            portion = meal_plan.portions_set.create(**portion_data)
        return meal_plan
