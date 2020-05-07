import numpy as np
from Equation import Equation

# CJK Henry weight and height equations
# MJ/d


def CJKH_WH(row):
    coefs = {  # coefs: wt, ht, free
        'm': {
            '0to3': [0.118, 3.59, -1.55],  # 0to3 as in >= 0 && < 3
            '3to10': [0.0632, 1.31, 1.28],  # 3to10
            '10to18': [0.0651, 1.11, 1.25],
            '18to30': [0.06, 1.31, 0.473],
            '30to60': [0.0476, 2.26, -0.574],
            '60plus': [0.0478, 2.26, -1.07]
        },
        'f': {
            '0to3': [0.127, 2.94, -1.20],
            '3to10': [0.0666, 0.878, 1.46],
            '10to18': [0.0393, 1.04, 1.93],
            '18to30': [0.0433, 2.57, -1.18],
            '30to60': [0.0342, 2.1, -0.0486],
            '60plus': [0.0356, 1.76, 0.0448]
        }
    }

    sex = ('m', 'f')[row['sex_f'] == 1]
    age = row['age']
    if age < 3:
        age_band = '0to3'
    elif 3 <= age < 10:
        age_band = '3to10'
    elif 10 <= age < 18:
        age_band = '10to18'
    elif 18 <= age < 30:
        age_band = '18to30'
    elif 30 <= age < 60:
        age_band = '30to60'
    else:
        age_band = '60plus'

    coefs = coefs[sex][age_band]
    return np.sum(row[['wt', 'ht']] * coefs[0:2]) + coefs[2]



eq_CJK = Equation(CJKH_WH)



