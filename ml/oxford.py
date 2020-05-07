# imports
from datetime import datetime
from pathlib import Path
import json
import scipy.stats
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


import tf_docs

# keras reset
tf.keras.backend.clear_session()
pd.options.display.width = 0

# should save this model to file?
should_save = True

# importing data
data = pd.read_csv('data/14k.csv', sep='\t', header=0)

# making dummy variables for sex
data['sex'] = data['sex'].map({1: 'm', 2: 'f'})
data = pd.get_dummies(data, columns=['sex'])


# specifying model information
MODEL_NAME = 'MyModel1'
MODEL_TITLE = 'My model #1'
MODEL_DESCRIPTION = 'One of the first tries'
CREATION_TIME = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
LABEL_TO_PREDICT = {
    'NAME': 'bmr',
    'LABEL': 'BMR',
    'FULL_LABEL': 'Basal metabolic rate',
    'UNIT': 'MJ/day',
    'ACCURACY': 3,
    'ALTERNATIVE_UNITS': [
        # accuracy is 0 decimal places, but not == 0 because JavaScript :/
        {'UNIT': 'kcal/day', 'RATE': 238.8458966, 'ACCURACY': 0.01}
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
LOSS = {'NAME': 'mse', 'LABEL': 'MSE', 'FULL_LABEL': 'Mean squared error'}
METRICS = [
    {'NAME': 'mae', 'LABEL': 'MAE', 'FULL_LABEL': 'Mean absolute error'},
    {'NAME': 'mse', 'LABEL': 'MSE', 'FULL_LABEL': 'Mean squared error'}
]
EARLY_STOPPING = {
    'PLANNED_EPOCHS': 1000,
    'PATIENCE': 150
}
#

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

# tweaking train stats to adjust for categorial variables
categorial = list(train_stats[(train_stats['min'] == 0) & (train_stats['max'] == 1)].index)
for el in categorial:
    train_stats.at[el, 'mean'] = 0
    train_stats.at[el, 'std'] = 1

# defining normalization function
def norm(x):
    return (x - train_stats['mean']) / train_stats['std']


# normalizing train and test data
normed_train_data = norm(train_dataset)
normed_test_data = norm(test_dataset)

# MODEL
def build_model():
    new_model = keras.Sequential([
        layers.Dense(8, activation='relu', input_shape=[len(train_dataset.keys())]),
        layers.Dense(8, activation='relu'),
        layers.Dense(8, activation='relu'),
        layers.Dense(1)
    ])

    new_model.compile(loss=LOSS['NAME'],
                      optimizer=tf.keras.optimizers.RMSprop(0.001),
                      metrics=[metric['NAME'] for metric in METRICS])
    return new_model


# building model
model = build_model()

# ? some model info
model.summary()

# early stopping (preventing overfitting)
early_stop = keras.callbacks.EarlyStopping(monitor='val_loss', patience=EARLY_STOPPING['PATIENCE'])
early_history = model.fit(normed_train_data, train_labels,
                          epochs=EARLY_STOPPING['PLANNED_EPOCHS'], validation_split=0.2, verbose=0,
                          callbacks=[early_stop, tf_docs.EpochDots()])

hist = pd.DataFrame(early_history.history)
hist['epoch'] = early_history.epoch
print(hist.head())
print(hist.tail())

plotter = tf_docs.HistoryPlotter(smoothing_std=2)

# mae and mse in time ?
"""
plt.figure(1)
plotter.plot({'Basic': early_history}, metric="mse")
plt.ylim([0, 300])
plt.ylabel('MSE [{}^2]'.format(LABEL_TO_PREDICT['LABEL']))
plt.figure(2)
plotter.plot({'Basic': early_history}, metric="mae")
plt.ylim([0, 75])
plt.ylabel('MAE [{}]'.format(LABEL_TO_PREDICT['LABEL']))
"""


test_metrics = dict(zip(model.metrics_names, model.evaluate(normed_test_data, test_labels, verbose=2)))
LOSS['VALUE'] = test_metrics['loss']
for metric in METRICS:
    metric['VALUE'] = np.float64(test_metrics[metric['NAME']])
    print('Testing set {}: {} {}'.format(metric['LABEL'], metric['VALUE'], LABEL_TO_PREDICT['LABEL']))


test_predictions = model.predict(normed_test_data).flatten()
plt.figure(3)
a = plt.axes(aspect='equal')
plt.scatter(test_labels, test_predictions)
plt.xlabel('True Values [{}]'.format(LABEL_TO_PREDICT['LABEL']))
plt.ylabel('Predictions [{}]'.format(LABEL_TO_PREDICT['LABEL']))
lims = [LOWER_LIM, HIGHER_LIM]
plt.xlim(lims)
plt.ylim(lims)
_ = plt.plot(lims, lims)

plt.show()

pearson_coef = scipy.stats.pearsonr(test_labels, test_predictions)[0]
print('Pearson correlation coeff: {}'.format(pearson_coef))
print('CJK coef was: 0.9080454760436276')



def write_to_files():
    # exporting means and stds, other model info
    Path('models/{}'.format(MODEL_NAME)).mkdir(exist_ok=True)

    model_info = {
        'MODEL_DESCRIPTION': MODEL_DESCRIPTION,
        'MODEL_NAME': MODEL_NAME,
        'MODEL_TITLE': MODEL_TITLE,
        'LABEL_TO_PREDICT': LABEL_TO_PREDICT,
        'SOURCE_FIELDS': SOURCE_FIELDS,
        'EARLY_STOPPING': EARLY_STOPPING,
        'CREATION_TIME': CREATION_TIME,
        'TEST_METRICS': [
            {
                'NAME': 'pearson',
                'LABEL': 'Correlation coefficient',
                'FULL_LABEL': 'Pearson correlation coefficient',
                'VALUE': pearson_coef
            }
        ] + METRICS,
        'LOSS': LOSS,
        'TRUE_VALUES': test_labels.tolist(),
        'PREDICTED_VALUES': test_predictions.tolist()
    }

    with open('models/{}/info.json'.format(MODEL_NAME), 'w', encoding='utf-8') as f:
        json.dump(model_info, f, ensure_ascii=False, indent=4)

    train_stats[['mean', 'std']].to_csv('models/{}/normalization.csv'.format(MODEL_NAME))
    model.save('models/{}'.format(MODEL_NAME), save_format='tf')

if should_save:
    write_to_files()

