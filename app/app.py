import numpy as np
import pandas as pd
import json
from flask import Flask, request, jsonify, render_template
from tensorflow import keras
from pathlib import Path

app = Flask(__name__, static_folder='client/build/static')

# model = keras.models.load_model('../ml/model')
# normalization = pd.read_csv('../ml/model/normalization.csv', header=0, index_col=0)
models_dir = Path('../ml/models')
models_info = []
normalization_info = {}
models = {}

for path in models_dir.glob('*'):
    normalization_info[path.name] = pd.read_csv('{}/normalization.csv'.format(path), header=0, index_col=0)
    models[path.name] = keras.models.load_model(str(path))
    with open('{}/info.json'.format(path), 'r', encoding='utf-8') as f:
        models_info.append(json.load(f))

def norm(x, normalization):
    return (x - normalization['mean']) / normalization['std']


@app.route('/')
def home():
    return app.send_static_file('index.html')


@app.route('/api/getModels', methods=['GET'])
def getModels():
    return jsonify(models_info)


@app.route('/api/predict', methods=['POST'])
def results():
    data = request.get_json(force=True)
    float_features = [float(x) for x in data.values()]
    final_features = norm(float_features, normalization_info[data['MODEL_NAME']])
    prediction = models[data['MODEL_NAME']].predict(pd.DataFrame(final_features).transpose())
    print(prediction)
    output = prediction[0][0]
    return str(output)


if __name__ == "__main__":
    app.run(debug=True)
