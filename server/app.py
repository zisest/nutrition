import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, render_template
from tensorflow import keras

app = Flask(__name__)
model = keras.models.load_model('../ml/model')
normalization = pd.read_csv('../ml/model/normalization.csv', header=0, index_col=0)


def norm(x):
    return (x - normalization['mean']) / normalization['std']


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    float_features = [float(x) for x in request.form.values()]
    final_features = norm(np.array(float_features))
    prediction = model.predict(pd.DataFrame(final_features).transpose())
    print(prediction[0][0])
    output = round(prediction[0][0], 2)

    return render_template('index.html', prediction_text='Sales should be $ {}'.format(output))


@app.route('/results', methods=['POST'])
def results():
    data = request.get_json(force=True)
    prediction = model.predict([np.array(list(data.values()))])

    output = prediction[0]
    return jsonify(output)


if __name__ == "__main__":
    app.run(debug=True)
