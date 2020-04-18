import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, render_template
from tensorflow import keras

app = Flask(__name__, static_folder='client/build/static')
model = keras.models.load_model('../ml/model')
normalization = pd.read_csv('../ml/model/normalization.csv', header=0, index_col=0)


def norm(x):
    return (x - normalization['mean']) / normalization['std']


@app.route('/')
def home():
    return app.send_static_file('index.html')


@app.route('/api/predict', methods=['POST'])
def results():
    data = request.get_json(force=True)
    float_features = [float(x) for x in data.values()]
    final_features = norm(float_features)
    prediction = model.predict(pd.DataFrame(final_features).transpose())
    print(prediction)
    output = prediction[0][0]
    return str(output)


if __name__ == "__main__":
    app.run(debug=True)
