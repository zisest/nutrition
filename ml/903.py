from sklearn import datasets
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

from pathlib import Path
import json

import tensorflow as tf
import tf_docs

from tensorflow import keras
from tensorflow.keras import layers
tf.keras.backend.clear_session()
pd.options.display.width = 0

data = pd.read_csv('data/903.csv', sep=';', header=0)
data.drop(columns=['PID', 'family_id', 'region', 'zygosity', 'SES', 'smoking_status', 'drinking_status', 'HOMA-IR'],
          inplace=True)

data['sex'] = data['sex'].map({1: 'm', 2: 'f'})
data['phys_act'] = data['phys_act'].map({1: 'low', 2: 'medium', 3: 'high'})
data = pd.get_dummies(data, columns=['sex', 'phys_act'])

MODEL_NAME = 'PredictingSmth9'
MODEL_TITLE = 'Predicting LBM'
MODEL_DESCRIPTION = 'based on glucose, insulin, TC, HDL-C, age'
LABEL_TO_PREDICT = 'LBM'
SOURCE_FIELDS = ['insulin', 'glucose', 'TC', 'HDL-C', 'age']

ALL_FIELDS = SOURCE_FIELDS + [LABEL_TO_PREDICT]

pred_data = data[ALL_FIELDS].copy().dropna()
print(pred_data.head())

LOWER_LIM = pred_data[LABEL_TO_PREDICT].min()
HIGHER_LIM = pred_data[LABEL_TO_PREDICT].max()

train_dataset = pred_data.sample(frac=0.8, random_state=0)
test_dataset = pred_data.drop(train_dataset.index)

# g = sns.pairplot(train_dataset, diag_kind="kde")
# plt.show()

train_stats = train_dataset.describe()
train_stats.pop(LABEL_TO_PREDICT)
train_stats = train_stats.transpose()
print(train_stats)

train_labels = train_dataset.pop(LABEL_TO_PREDICT)
test_labels = test_dataset.pop(LABEL_TO_PREDICT)


# tweaking train stats to adjust for categorial variables
categorial = list(train_stats[(train_stats['min'] == 0) & (train_stats['max'] == 1)].index)
for el in categorial:
    train_stats.at[el, 'mean'] = 0
    train_stats.at[el, 'std'] = 1

# exporting means and stds, other model info
Path('models/{}'.format(MODEL_NAME)).mkdir(exist_ok=True)

model_info = {
    'MODEL_DESCRIPTION': MODEL_DESCRIPTION,
    'MODEL_NAME': MODEL_NAME,
    'MODEL_TITLE': MODEL_TITLE,
    'LABEL_TO_PREDICT': LABEL_TO_PREDICT,
    'SOURCE_FIELDS': SOURCE_FIELDS,
    'CATEGORIAL_LABELS': categorial
}
with open('models/{}/info.json'.format(MODEL_NAME), 'w', encoding='utf-8') as f:
    json.dump(model_info, f, ensure_ascii=False, indent=4)
train_stats[['mean', 'std']].to_csv('models/{}/normalization.csv'.format(MODEL_NAME))

def norm(x):
    return (x - train_stats['mean']) / train_stats['std']


normed_train_data = norm(train_dataset)
normed_test_data = norm(test_dataset)

print(normed_train_data)


def build_model():
    new_model = keras.Sequential([
        layers.Dense(8, activation='relu', input_shape=[len(train_dataset.keys())]),
        layers.Dense(1)
    ])

    optimizer = tf.keras.optimizers.RMSprop(0.001)

    new_model.compile(loss='mse',
                      optimizer=optimizer,
                      metrics=['mae', 'mse'])
    return new_model


model = build_model()
model.summary()

EPOCHS = 1000

"""
history = model.fit(
    normed_train_data, train_labels,
    epochs=EPOCHS, validation_split=0.2, verbose=0,
    callbacks=[tf_docs.EpochDots()])
"""

# early stop = prevent overfitting
PATIENCE = 90
early_stop = keras.callbacks.EarlyStopping(monitor='val_loss', patience=PATIENCE)
early_history = model.fit(normed_train_data, train_labels,
                          epochs=EPOCHS, validation_split=0.2, verbose=0,
                          callbacks=[early_stop, tf_docs.EpochDots()])

hist = pd.DataFrame(early_history.history)
hist['epoch'] = early_history.epoch
print(hist.head())
print(hist.tail())

plotter = tf_docs.HistoryPlotter(smoothing_std=2)

plt.figure(1)
plotter.plot({'Basic': early_history}, metric="mse")
plt.ylim([0, 300])
plt.ylabel('MSE [{}^2]'.format(LABEL_TO_PREDICT))

plt.figure(2)
plotter.plot({'Basic': early_history}, metric="mae")
plt.ylim([0, 75])
plt.ylabel('MAE [{}]'.format(LABEL_TO_PREDICT))


model.save('models/{}'.format(MODEL_NAME), save_format='tf')


loss, mae, mse = model.evaluate(normed_test_data, test_labels, verbose=2)

print("Testing set Mean Abs Error: {:5.2f} {}".format(mae, LABEL_TO_PREDICT))
print("Testing set MSE: {:5.2f} {}".format(mse, LABEL_TO_PREDICT))

test_predictions = model.predict(normed_test_data).flatten()
plt.figure(3)
a = plt.axes(aspect='equal')
plt.scatter(test_labels, test_predictions)
plt.xlabel('True Values [{}]'.format(LABEL_TO_PREDICT))
plt.ylabel('Predictions [{}]'.format(LABEL_TO_PREDICT))
lims = [LOWER_LIM, HIGHER_LIM]
plt.xlim(lims)
plt.ylim(lims)
_ = plt.plot(lims, lims)

plt.show()
