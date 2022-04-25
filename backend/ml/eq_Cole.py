import numpy as np
from math import exp, log
from ml.Equation import Equation

# TJ Cole weight and height equations
# MJ/d


def Cole(row):
    bmi = row['weight'] / (row['height'] * row['height'])
    if row['age'] < 18 or row['age'] > 80:
        return 0
    if bmi < 25:
        if row['sex_f'] == 1:
            return exp(-0.1934 - 0.00199*row['age'] + 0.4764*log(row['weight']) + 0.0194*log(row['height']))
        else:
            return exp(-0.1631 - 0.00255*row['age'] + 0.4721*log(row['weight']) + 0.2952*log(row['height']))
    else:
        if row['sex_f'] == 1:
            return exp(-0.0713 - 0.00209*row['age'] + 0.4075*log(row['weight']) + 0.354*log(row['height']))
        else:
            return exp(-0.263 - 0.00277*row['age'] + 0.4877*log(row['weight']) + 0.3367*log(row['height']))


eq_Cole = Equation(Cole)



