import numpy as np
from ml.Equation import Equation


def HB(row):
    coefs = {  # coefs: wt, ht, age, free
        'm': [13.7516, 500.33, -6.755, 66.473],
        'f': [9.5634, 184.96, -4.6756, 655.0955]
    }

    sex = ('m', 'f')[row['sex_f'] == 1]
    coefs = coefs[sex]
    return (np.sum(row[['weight', 'height', 'age']] * coefs[0:3]) + coefs[3])*0.0041868  # kcal to MJ


eq_HB = Equation(HB)



