from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator

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
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(110)]
    )
    weight = models.FloatField(blank=True)
    height = models.FloatField(blank=True)
    sex = models.CharField(
        max_length=1,
        choices=SEXES,
        blank=False,
        default='m'
    )
    # meals = models.IntegerField(
    #     blank=True,
    #     validators=[MinValueValidator(2), MaxValueValidator(7)]
    # )
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