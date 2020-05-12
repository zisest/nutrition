import numpy as np
from ml.Equation import Equation

# FAO/WHO/UNU 1981 equations (from Annex 1)
# combined weight-height and weight-only (for children)
# kcal/d coefs -> MJ/d result


def FAO81_comb(row):
    coefs = {  # coefs: wt, ht, free
        'm': {
            '0to3': [60.9, 0, -54],  # 0to3 as in >= 0 && < 3
            '3to10': [22.7, 0, 495],  # 3to10
            '10to18': [16.6, 77, 572],
            '18to30': [15.4, -27, 717],
            '30to60': [11.3, 16, 901],
            '60plus': [8.8, 1128, -1071]
        },
        'f': {
            '0to3': [61, 0, -51],  # 0to3 as in >= 0 && < 3
            '3to10': [22.5, 0, 499],  # 3to10
            '10to18': [7.4, 482, 217],
            '18to30': [13.3, 334, 35],
            '30to60': [8.7, -25, 865],
            '60plus': [9.2, 637, -302]
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
    return (np.sum(row[['wt', 'ht']] * coefs[0:2]) + coefs[2])*0.0041868  # kcal to MJ


eq_FAO81_combined = Equation(FAO81_comb)



