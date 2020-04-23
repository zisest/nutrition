import React from 'react'
import ResultSection from '../src/components/result-section'
import Window from '../src/components/window'

export default { 
  title: 'ResultSection',
  component: ResultSection
}

let model = {
  "LABEL_TO_PREDICT": {
    "NAME": "bmr",
    "LABEL": "BMR",
    "FULL_LABEL": "Basal metabolic rate",
    "UNIT": "MJ/day",
    "ACCURACY": 3,
    "ALTERNATIVE_UNITS": [
        {
            "UNIT": "kcal/day",
            "RATE": 238.8458966,
            "ACCURACY": 0.001
        }
    ]
},
"SOURCE_FIELDS": [
    {
        "NAME": "age",
        "CATEGORIAL": false,
        "UNIT": "years",
        "ALTERNATIVE_UNITS": [],
        "DEFAULT_VALUE": 42
    },
    {
        "NAME": "wt",
        "CATEGORIAL": false,
        "LABEL": "weight",
        "UNIT": "kg",
        "ALTERNATIVE_UNITS": [],
        "DEFAULT_VALUE": 74
    },
    {
        "NAME": "ht",
        "CATEGORIAL": false,
        "LABEL": "height",
        "UNIT": "m",
        "ALTERNATIVE_UNITS": [
            {
                "UNIT": "cm",
                "RATE": 100
            }
        ],
        "DEFAULT_VALUE": 1.72
    },
    {
        "NAME": "sex",
        "CATEGORIAL": true,
        "VALUES": [
            {
                "NAME": "m",
                "LABEL": "male"
            },
            {
                "NAME": "f",
                "LABEL": "female"
            }
        ],
        "DEFAULT_VALUE": "m"
    }
]
}
let input = {
  ht: '1.72',
  wt: '67',
  age: '24',
  sex: 'm'
}
let result = 7.2547809

export const ResultSectionStory = () => 
  <Window width='150px' title='Results'>
    <ResultSection input={input} result={result} model={model} />
  </Window>

export const row = () => 
<Window title='Results'>
  <ResultSection layout='row' input={input} result={result} model={model} />
</Window>

  