import numpy as np
import pandas as pd
import json
from flask import Flask, request, jsonify
from tensorflow import keras
from pathlib import Path



app = Flask(__name__, static_folder='client/build/static')

equations_dir = Path('../ml/equations')

models_dir = Path('../ml/models')
models_info = []
normalization_info = {}
models = {}

for path in models_dir.glob('*'):
    normalization_info[path.name] = pd.read_csv('{}/normalization.csv'.format(path), header=0, index_col=0)
    models[path.name] = keras.models.load_model(str(path))
    with open('{}/info.json'.format(path), 'r', encoding='utf-8') as f:
        models_info.append(json.load(f))

for path in equations_dir.glob('*'):
    normalization_info[path.name] = pd.read_csv('{}/normalization.csv'.format(path), header=0, index_col=0)
    models[path.name] = pd.read_pickle(str(path) + '/eq.pkl')
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

    parsedDict = {}
    for field in model_info['SOURCE_FIELDS']:
        if field['NAME'] not in req.keys():
            return False
        if field['CATEGORIAL']:
            for val in field['VALUES']:
                parsedDict[field['NAME'] + '_' + val['NAME']] = float(req[field['NAME']] == val['NAME'])
        else:
            parsedDict[field['NAME']] = float(req[field['NAME']])
    parsed = list(parsedDict.values())
    return parsed, model_name



@app.route('/api/predict', methods=['POST'])
def results():
    data = request.get_json(force=True)
    print(data)
    parsed, model_name = parse_request(data)
    print(parsed)
    if not parsed:
        return str('ERROR') # CHANGE
    normalized = norm(parsed, normalization_info[model_name])
    prediction = models[model_name].predict(pd.DataFrame(normalized).transpose())

    output = np.array(prediction).flatten()[0]
    print(output)
    return str(output)


if __name__ == "__main__":
    app.run(debug=True)
