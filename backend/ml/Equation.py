import pandas as pd


class Equation:
    def __init__(self, predict_row):
        self.predict_row = predict_row

    def predict(self, df):
        return df.apply(self.predict_row, axis=1)
