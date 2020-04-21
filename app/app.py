import numpy as np
import pandas as pd
import json
from flask import Flask, request, jsonify
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



def parse_request(req):
    model_name = req['MODEL_NAME']
    model_info = next((item for item in models_info if item['MODEL_NAME'] == model_name), False)

    if not model_info:
        return False
    catLabels = set([item.split('_')[0] for item in model_info['CATEGORIAL_LABELS']])
    catValues = {item: 0 for item in model_info['CATEGORIAL_LABELS']}
    # catValues.update({item+'_'+req[item]: 1 for item in catLabels})
    for item in catLabels:
        catValues.update({item+'_'+req.pop(item, None): 1})
    req.update(catValues)
    req.pop('MODEL_NAME', None)
    parsed = [float(req[key]) for key in model_info['SOURCE_FIELDS'] if key in req]
    if len(parsed) != len(model_info['SOURCE_FIELDS']):
        return False
    return parsed, model_name



@app.route('/api/predict', methods=['POST'])
def results():
    data = request.get_json(force=True)
    parsed, model_name = parse_request(data)
    if not parsed:
        return str('ERROR')
    normalized = norm(parsed, normalization_info[model_name])
    prediction = models[model_name].predict(pd.DataFrame(normalized).transpose())
    print(prediction)
    output = prediction[0][0]
    return str(output)


if __name__ == "__main__":
    app.run(debug=True)
