from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.postgres.fields import ArrayField

# Create your models here.


class AppUser(AbstractUser):
    pass


class UserParams(models.Model):
    SEXES = [
        ('m', 'male'),
        ('f', 'female')
    ]

    GOALS = [
        ('lose', 'Lose weight'),
        ('maintain', 'Maintain weight'),
        ('gain', 'Gain weight')
    ]

    PALS = [
        ('sedentary', 'Sedentary or lightly active'),
        ('moderate', 'Moderately active'),
        ('active', 'Active'),
        ('high', 'Highly active')
    ]


    user = models.OneToOneField(
        AppUser,
        on_delete=models.CASCADE,
        primary_key=True
    )

    age = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(110)]
    )
    weight = models.FloatField()
    height = models.FloatField()
    sex = models.CharField(
        max_length=1,
        choices=SEXES,
        blank=False,
        default='m'
    )
    goal = models.CharField(
        choices=GOALS,
        blank=False,
        default='maintain',
        max_length=8
    )
    activity = models.CharField(
        choices=PALS,
        blank=False,
        default='moderate',
        max_length=9
    )


class UserPreferences(models.Model):
    PREFERENCES = [
        ('vegan', 'vegan'),
        ('vegetarian', 'vegetarian'),
        ('halal', 'halal'),
        ('gluten-free', 'gluten-free'),
        ('low-lactose', 'low-lactose')
    ]

    user = models.OneToOneField(
        AppUser,
        on_delete=models.CASCADE,
        primary_key=True
    )

    preferences = ArrayField(
        models.CharField(
            choices=PREFERENCES,
            max_length=11
        ),
        blank=True,
        default=list
    )

    meals = models.IntegerField(
        blank=False,
        default=4,
        validators=[MinValueValidator(2), MaxValueValidator(7)]
    )


class UserRequirements(models.Model):
    user = models.OneToOneField(
        AppUser,
        on_delete=models.CASCADE,
        primary_key=True
    )

    bmr = models.DecimalField(  # all energy values are in MJ
        max_digits=5,
        decimal_places=3,
        blank=True,
        null=True
    )
    tee = models.DecimalField(
        max_digits=5,
        decimal_places=3,
        blank=True,
        null=True
    )
    energy_requirements = models.DecimalField(
        max_digits=5,
        decimal_places=3,
        blank=True,
        null=True
    )

    proteins = models.PositiveIntegerField(
        blank=True,
        null=True
    )
    fats = models.PositiveIntegerField(
        blank=True,
        null=True
    )
    carbohydrates = models.PositiveIntegerField(
        blank=True,
        null=True
    )


class FoodCategory(models.Model):
    FOOD_CATEGORIES = [
        'vegan',
        'vegetarian',
        'halal',
        'gluten-free',
        'low-lactose',
        'breakfast',
        'dinner',
        'snack',
        'dessert',
        'drink',
        'meal',
        'dairy',
        'grain',
        'vegetable',
        'fruit',
        'meat',
        'side',
        'nut'
    ]

    def __str__(self):
        return self.name

    name = models.CharField(
        blank=False,
        null=False,
        choices=[(category, category) for category in FOOD_CATEGORIES],
        default='dinner',
        max_length=11
    )


class Food(models.Model):
    def __str__(self):
        return self.name


    name = models.CharField(
        blank=False,
        null=False,
        max_length=64
    )

    categories = models.ManyToManyField('FoodCategory', related_name='foods', blank=True)

    source_categories = ArrayField(
        models.CharField(
            max_length=64
        ),
        default=list
    )

    water = models.FloatField(null=True, blank=True)
    protein = models.FloatField(null=True, blank=True)
    fat = models.FloatField(null=True, blank=True)
    carbohydrate = models.FloatField(null=True, blank=True)
    sfa = models.FloatField(null=True, blank=True)
    pufa = models.FloatField(null=True, blank=True)
    cholesterol = models.FloatField(null=True, blank=True)
    mds = models.FloatField(null=True, blank=True)
    starch = models.FloatField(null=True, blank=True)
    fiber = models.FloatField(null=True, blank=True)
    organic_acid = models.FloatField(null=True, blank=True)
    sodium = models.FloatField(null=True, blank=True)
    potassium = models.FloatField(null=True, blank=True)
    calcium = models.FloatField(null=True, blank=True)
    magnesium = models.FloatField(null=True, blank=True)
    phosphorus = models.FloatField(null=True, blank=True)
    iron = models.FloatField(null=True, blank=True)
    retinol = models.FloatField(null=True, blank=True)
    beta_carotene = models.FloatField(null=True, blank=True)
    retinol_eq = models.FloatField(null=True, blank=True)
    tocopherol_eq = models.FloatField(null=True, blank=True)
    thiamine = models.FloatField(null=True, blank=True)
    riboflavin = models.FloatField(null=True, blank=True)
    niacin = models.FloatField(null=True, blank=True)
    niacin_eq = models.FloatField(null=True, blank=True)
    vitamin_c = models.FloatField(null=True, blank=True)
    energy = models.FloatField(null=True, blank=True)
    portion = models.FloatField(null=True, blank=True)


