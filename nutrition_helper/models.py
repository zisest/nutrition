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
        ('kosher', 'kosher'),
        ('halal', 'halal'),
        ('gluten-free', 'gluten-free'),
        ('low-lactose', 'low-lactose'),
        ('raw', 'raw')
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