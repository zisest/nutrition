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
from sklearn.model_selection import KFold
import sklearn.metrics
from ml import tf_docs

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
MODEL_NAME = '6Tuned1'
MODEL_TITLE = '6-Tuned #1'
MODEL_DESCRIPTION = '[60, 60, 88, 88, 60, 60], 1000/100, 0.001'
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
        'NAME': 'weight',
        'CATEGORIAL': False,
        'LABEL': 'weight',
        'UNIT': 'kg',
        'ALTERNATIVE_UNITS': [],
        'DEFAULT_VALUE': 74
    },
    {
        'NAME': 'height',
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
    'PATIENCE': 100
}
LAYERS = [60, 60, 88, 88, 60, 60]
LEARNING_RATE = 0.001
#

# parsing fields info
NON_CATEGORIAL_FIELDS = [field['NAME'] for field in SOURCE_FIELDS if not field['CATEGORIAL']]
CATEGORIAL_FIELDS = [[field['NAME'] + '_' + value['NAME'] for value in field['VALUES']] for field in SOURCE_FIELDS if
                     field['CATEGORIAL']]
SOURCE_LABELS = NON_CATEGORIAL_FIELDS + [item for sublist in CATEGORIAL_FIELDS for item in sublist]
ALL_FIELDS = SOURCE_LABELS + [LABEL_TO_PREDICT['NAME']]
# -> ['field1', 'field2', 'field3_t', 'field3_f', 'to_predict']

# all data with only selected fields
model_dataset = data[ALL_FIELDS].copy().dropna()

# finding min and max values of LABEL_TO_PREDICT for plotting
LOWER_LIM = model_dataset[LABEL_TO_PREDICT['NAME']].min()
HIGHER_LIM = model_dataset[LABEL_TO_PREDICT['NAME']].max()

# dividing dataset to train and test samples
# train_dataset = model_dataset.sample(frac=0.8)
# test_dataset = model_dataset.drop(train_dataset.index)

# getting train data statistics (mean, std)
model_stats = model_dataset.describe()
model_stats.pop(LABEL_TO_PREDICT['NAME'])
model_stats = model_stats.transpose()
print(model_stats)

# separating source labels from target label
labels = model_dataset.pop(LABEL_TO_PREDICT['NAME'])
fitting_data = model_dataset

# tweaking  stats to adjust for categorial variables
categorial = list(model_stats[(model_stats['min'] == 0) & (model_stats['max'] == 1)].index)
for el in categorial:
    model_stats.at[el, 'mean'] = 0
    model_stats.at[el, 'std'] = 1


# defining normalization function
def norm(x):
    return (x - model_stats['mean']) / model_stats['std']


# normalizing  data
normed_data = norm(fitting_data)


def pearson_correlation(y_true, y_predict):
    return scipy.stats.pearsonr(y_true, y_predict)[0]


# MODEL
# early stopping (preventing overfitting)
early_stop = keras.callbacks.EarlyStopping(monitor='val_loss', patience=EARLY_STOPPING['PATIENCE'])


def build_model(input_shape):
    new_model = keras.Sequential()
    new_model.add(layers.Input(shape=[input_shape]))
    for layer in LAYERS:
        new_model.add(layers.Dense(layer, activation='relu'))
    new_model.add(layers.Dense(1))

    new_model.compile(loss=LOSS['NAME'],
                      optimizer=tf.keras.optimizers.RMSprop(learning_rate=LEARNING_RATE),
                      metrics=[metric['NAME'] for metric in METRICS])
    return new_model


# metrics
all_metrics = []

# cv
kf = KFold(n_splits=5, shuffle=True)
for train_indices, test_indices in kf.split(normed_data):
    normed_train_data = normed_data.iloc[train_indices]
    normed_test_data = normed_data.iloc[test_indices]
    train_labels = labels.iloc[train_indices]
    test_labels = labels.iloc[test_indices]

    model = build_model(5)
    model.summary()

    early_history = model.fit(normed_train_data, train_labels,
                              epochs=EARLY_STOPPING['PLANNED_EPOCHS'], verbose=0,
                              callbacks=[early_stop, tf_docs.EpochDots()],
                              validation_split=0.2)

    test_metrics = dict(zip(model.metrics_names, model.evaluate(normed_test_data, test_labels, verbose=2)))

    test_predictions = model.predict(normed_test_data).flatten()
    test_metrics['pearson'] = pearson_correlation(test_labels, test_predictions)

    all_metrics.append(test_metrics)

mean_metrics = {metric: sum(fold[metric] for fold in all_metrics) / len(all_metrics) for metric in
                all_metrics[0].keys()}

print(mean_metrics)

LOSS['VALUE'] = mean_metrics['loss']
for metric in METRICS:
    metric['VALUE'] = np.float64(mean_metrics[metric['NAME']])
    # print('Testing set {}: {} {}'.format(metric['LABEL'], metric['VALUE'], LABEL_TO_PREDICT['LABEL']))

METRICS = [{'NAME': 'pearson', 'LABEL': 'Correlation coefficient',
            'FULL_LABEL': 'Pearson correlation coefficient', 'VALUE': mean_metrics['pearson']}] + METRICS

plt.figure(0)
a = plt.axes(aspect='equal')
plt.scatter(test_labels, test_predictions)
plt.xlabel('True Values [{}]'.format(LABEL_TO_PREDICT['LABEL']))
plt.ylabel('Predictions [{}]'.format(LABEL_TO_PREDICT['LABEL']))
lims = [LOWER_LIM, HIGHER_LIM]
plt.xlim(lims)
plt.ylim(lims)
_ = plt.plot(lims, lims)

plt.show()


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
        'LAYERS': LAYERS,
        'CREATION_TIME': CREATION_TIME,
        'TEST_METRICS': METRICS,
        'LOSS': LOSS,
        'TRUE_VALUES': test_labels.tolist(),
        'PREDICTED_VALUES': test_predictions.tolist(),
        'LEARNING_RATE': LEARNING_RATE
    }

    with open('models/{}/info.json'.format(MODEL_NAME), 'w', encoding='utf-8') as f:
        json.dump(model_info, f, ensure_ascii=False, indent=4)

    model_stats[['mean', 'std']].to_csv('models/{}/normalization.csv'.format(MODEL_NAME))
    model.save('models/{}'.format(MODEL_NAME), save_format='tf')


if should_save:
    write_to_files()
