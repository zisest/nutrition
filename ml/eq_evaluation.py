from Equation import Equation
import pandas as pd
import scipy.stats
from pathlib import Path
import json

from eq_CJK import eq_CJK
from eq_FAO81_combined import eq_FAO81_combined
from eq_HB import eq_HB


eq = eq_HB

# should save this model to file?
should_save = True

# 1 MJ = 238.8459 kcal
# 1 kcal = 0.0041868 MJ

# model info
TYPE = 'equation'
MODEL_NAME = 'HB'
MODEL_TITLE = 'Harris-Benedict equations'
MODEL_DESCRIPTION = 'First BMR estimation formulas (1918)'
CREATION_TIME = '1918'
LABEL_TO_PREDICT = {
    'NAME': 'bmr',
    'LABEL': 'BMR',
    'FULL_LABEL': 'Basal metabolic rate',
    'UNIT': 'MJ/day',
    'ACCURACY': 3,
    'ALTERNATIVE_UNITS': [
        # accuracy is 0 decimal places, but not == 0 because JavaScript :/
        {'UNIT': 'kcal/day', 'RATE': 238.8459, 'ACCURACY': 0.01}
    ]
}
SOURCE_FIELDS = [
    {
        'NAME': 'age',
        'CATEGORIAL': False,
        'UNIT': 'years',
        'ALTERNATIVE_UNITS': [],
        'DEFAULT_VALUE': 42
    },
    {
        'NAME': 'wt',
        'CATEGORIAL': False,
        'LABEL': 'weight',
        'UNIT': 'kg',
        'ALTERNATIVE_UNITS': [],
        'DEFAULT_VALUE': 74
    },
    {
        'NAME': 'ht',
        'CATEGORIAL': False,
        'LABEL': 'height',
        'UNIT': 'm',
        'ALTERNATIVE_UNITS': [
            {'UNIT': 'cm', 'RATE': 100}
        ],
        'DEFAULT_VALUE': 1.72
    },
    {
        'NAME': 'sex',
        'CATEGORIAL': True,
        'VALUES': [
            {'NAME': 'm', 'LABEL': 'male'},
            {'NAME': 'f', 'LABEL': 'female'},
        ],
        'DEFAULT_VALUE': 'm'
    }
]



# importing data
data = pd.read_csv('data/14k.csv', sep='\t', header=0)

# making dummy variables for sex
data['sex'] = data['sex'].map({1: 'm', 2: 'f'})
data = pd.get_dummies(data, columns=['sex'])

# parsing fields info
NON_CATEGORIAL_FIELDS = [field['NAME'] for field in SOURCE_FIELDS if not field['CATEGORIAL']]
CATEGORIAL_FIELDS = [[field['NAME'] + '_' + value['NAME'] for value in field['VALUES']] for field in SOURCE_FIELDS if field['CATEGORIAL']]
SOURCE_LABELS = NON_CATEGORIAL_FIELDS + [item for sublist in CATEGORIAL_FIELDS for item in sublist]
ALL_FIELDS = SOURCE_LABELS + [LABEL_TO_PREDICT['NAME']]
# -> ['field1', 'field2', 'field3_t', 'field3_f', 'to_predict']

# all data with only selected fields
model_dataset = data[ALL_FIELDS].copy().dropna()

# finding min and max values of LABEL_TO_PREDICT for plotting
LOWER_LIM = model_dataset[LABEL_TO_PREDICT['NAME']].min()
HIGHER_LIM = model_dataset[LABEL_TO_PREDICT['NAME']].max()

# dividing dataset to train and test samples
train_dataset = model_dataset.sample(frac=0.8, random_state=72)
test_dataset = model_dataset.drop(train_dataset.index)

# getting train data statistics (mean, std)
train_stats = train_dataset.describe()
train_stats.pop(LABEL_TO_PREDICT['NAME'])
train_stats = train_stats.transpose()
print(train_stats)

# separating source labels from target label
train_labels = train_dataset.pop(LABEL_TO_PREDICT['NAME'])
test_labels = test_dataset.pop(LABEL_TO_PREDICT['NAME'])

for el in SOURCE_LABELS:
    train_stats.at[el, 'mean'] = 0
    train_stats.at[el, 'std'] = 1

test_predictions = eq.predict(test_dataset)
pearson_coef = scipy.stats.pearsonr(test_labels, test_predictions)[0]



def write_to_files():
    # exporting means and stds, other model info
    Path('equations/{}'.format(MODEL_NAME)).mkdir(exist_ok=True)

    model_info = {
        'TYPE': TYPE,
        'MODEL_DESCRIPTION': MODEL_DESCRIPTION,
        'MODEL_NAME': MODEL_NAME,
        'MODEL_TITLE': MODEL_TITLE,
        'LABEL_TO_PREDICT': LABEL_TO_PREDICT,
        'SOURCE_FIELDS': SOURCE_FIELDS,
        'CREATION_TIME': CREATION_TIME,
        'TEST_METRICS': [
            {
                'NAME': 'pearson',
                'LABEL': 'Correlation coefficient',
                'FULL_LABEL': 'Pearson correlation coefficient',
                'VALUE': pearson_coef
            }
        ],
        'TRUE_VALUES': test_labels.tolist(),
        'PREDICTED_VALUES': test_predictions.tolist()
    }

    with open('equations/{}/info.json'.format(MODEL_NAME), 'w', encoding='utf-8') as f:
        json.dump(model_info, f, ensure_ascii=False, indent=4)

    train_stats[['mean', 'std']].to_csv('equations/{}/normalization.csv'.format(MODEL_NAME))

    pd.to_pickle(eq_CJK, f'equations/{MODEL_NAME}/eq.pkl')


if should_save:
    write_to_files()