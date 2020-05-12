import numpy as np
from ml.Equation import Equation


# Mifflin, St Jeor


def Mifflin_StJeor(row):
    # weight, height, age, sex (m = 1, f = 0), free
    coefs = [9.99, 625, -4.92, 166, -161]
    return (np.sum(row[['wt', 'ht', 'age', 'sex_m']] * coefs[0:4]) + coefs[4])*0.0041868  # kcal to MJ


eq_Mifflin_StJeor = Equation(Mifflin_StJeor)



