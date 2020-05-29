import tensorflow as tf
from tensorflow import keras
import kerastuner as kt
import pandas as pd


# importing data
data = pd.read_csv('data/14k.csv', sep='\t', header=0)
# making dummy variables for sex
data['sex'] = data['sex'].map({1: 'm', 2: 'f'})
data = pd.get_dummies(data, columns=['sex'])

model_dataset = data[['age', 'weight', 'height', 'sex_m', 'sex_f', 'bmr']].copy().dropna()

train_dataset = model_dataset.sample(frac=0.8)
test_dataset = model_dataset.drop(train_dataset.index)


# getting train data statistics (mean, std)
train_stats = train_dataset.describe()
train_stats.pop('bmr')
train_stats = train_stats.transpose()
print(train_stats)

# separating source labels from target label
train_labels = train_dataset.pop('bmr')
test_labels = test_dataset.pop('bmr')

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


def model_builder(hp):
    units1 = hp.Int('units1', min_value=16, max_value=80, step=8)
    # units2 = hp.Int('units2', min_value=32, max_value=64, step=8)
    # units3 = hp.Int('units3', min_value=32, max_value=64, step=4)

    model = keras.Sequential()
    model.add(keras.Input(shape=[len(normed_train_data.keys())]))
    model.add(keras.layers.Dense(units=units1, activation='relu'))
    model.add(keras.layers.Dense(units=units1, activation='relu'))
    model.add(keras.layers.Dense(units=units1, activation='relu'))
    model.add(keras.layers.Dense(1))

    # Tune the learning rate for the optimizer
    # Choose an optimal value from 0.01, 0.001, or 0.0001
    hp_learning_rate = hp.Choice('learning_rate', values=[1e-2, 1e-3, 1e-4])

    model.compile(optimizer=keras.optimizers.RMSprop(learning_rate=hp_learning_rate),
                  loss='mse',
                  metrics=['mae', 'mse'])

    return model


tuner = kt.Hyperband(
    model_builder,
    objective='val_mse',
    max_epochs=1000,
    factor=3,
    directory='tuning',
    project_name='hyper2'
)

tuner.search(normed_train_data, train_labels,
             epochs=1000,
             validation_data=(normed_test_data, test_labels))



# models = tuner.get_best_models(num_models=5)
# print(models)
print('----')
tuner.results_summary()
