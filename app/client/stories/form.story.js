import React from 'react'
import Form from '../src/components/form'
import Input  from '../src/components/input'
import Window from '../src/components/window'

export default { 
  title: 'Form',
  component: Form
}

const SOURCE_FIELDS = ['insulin', 'glucose', 'TC', 'HDL-C', 'TG', 'LDL-C', 'age', ['sex_f', 'sex_m']]
const MAPPED = SOURCE_FIELDS.map(label => {
  if (Array.isArray(label)) {
    return {
      type: 'radio',
      name: label[0].split('_')[0],
      initialValue: label[0].split('_')[1],
      options: label.map(option => ({name: option.split('_')[1]})),
      required: true
    }
  } else
    return {
      type: 'text',
      name: label,
      label,
      regex: /^-?([0-9]+([.][0-9]*)?|[.][0-9]+)$/,
      required: true,
      maxLength: 5
    }
})


let fields2 = [
  {
    type: 'text',
    name: 'field1',
    label: 'Field 1',
    regex: /^-?([0-9]+([.][0-9]*)?|[.][0-9]+)$/,
    required: true,
    maxLength: 5
  },
  {
    type: 'text',
    name: 'field2',
    label: 'Field 2',
    regex: /^-?([0-9]+([.][0-9]*)?|[.][0-9]+)$/,
    required: true,
    maxLength: 5
  },
  {
    type: 'radio',
    name: 'radio1',
    required: true,
    options: [{name: 'opt1', label: 'Option 1'}, {name: 'opt2', label: 'Option 2'}],
    required: true,
    initialValue: 'opt1'
  },
  {
    type: 'select',
    label: 'Select 2',
    double: false,
    name: 'select2',
    required: true,
    options: [
      {
        name: 'opt11',
        label: 'Sedentary or light activity',
        description: 'These people have occupations that do not demand much physical effort, are not required to walk long distances'
      },
      {
        name: 'opt12',
        label: 'Active or moderately active',
        description: 'These people have occupations that are not strenuous in terms of energy demands, but involve more energy expenditure than that described for sedentary lifestyles'
      },
      {
        name: 'opt13',
        label: 'Vigorous or vigorously active',
        description: 'These people engage regularly in strenuous work or in strenuous leisure activities for several hours'
      },

    ],
    initialValue: 'opt13'
  },
  {
    type: 'select',
    label: 'Select 1',
    double: true,
    name: 'select1',
    required: true,
    options: [
      {
        name: 'opt1',
        label: 'Sedentary or light activity',
        description: 'These people have occupations that do not demand much physical effort, are not required to walk long distances'
      },
      {
        name: 'opt2',
        label: 'Active or moderately active',
        description: 'These people have occupations that are not strenuous in terms of energy demands, but involve more energy expenditure than that described for sedentary lifestyles'
      },
      {
        name: 'opt3',
        label: 'Vigorous or vigorously active',
        description: 'These people engage regularly in strenuous work or in strenuous leisure activities for several hours'
      },

    ],
    initialValue: 'opt2'
  },
 
  {
    type: 'slider',
    label: 'Slider 1',
    double: false,
    name: 'slider1',
    required: true,    
    options: [
      {
        name: 'sl1',
        label: 'Loose fat',
        description: 'These people have occupations that do not demand much physical effort, are not required to walk long distances'
      },
      {
        name: 'sl2',
        label: 'Maintain weight',
        description: 'These people have occupations that are not strenuous in terms of energy demands, but involve more energy expenditure than that described for sedentary lifestyles'
      },
      {
        name: 'sl3',
        label: 'Gain muscle',
        description: 'These people engage regularly in strenuous work or in strenuous leisure activities for several hours'
      }
    ],
    initialValue: 'sl2'
  },
  {
    type: 'checkbox',
    layout: [2, 3, 2],
    name: 'check1',
    options: [
      {name: 'check1', label: 'Check 1'},
      {name: 'check2', label: 'Check 2'}, 
      {name: 'check3', label: 'Check 3'},
      {name: 'check4', label: 'Check 4'},
      {name: 'check5', label: 'Check 5'}, 
      {name: 'check6', label: 'Check 6'},
      {name: 'check7', label: 'Check 7'},
    ]
    
  }
]


export const FormStory = () => 
  <Window blank width='600px'>
    <Form columns={2} 
    dataToSend={{MODEL_NAME: 'PredictingLBM1'}}
    submitUrl='/api/predict' 
    fields={MAPPED} 
    submitText={'Predict'}
    formTitle={'Parameters'}
    />
  </Window>

export const FormStory2 = () => 
  <Window blank width='600px'>
    <Form columns={2} 
    dataToSend={{MODEL_NAME: 'PredictingLBM1'}}
    submitUrl='/api/predict' 
    fields={fields2} 
    submitText={'Predict'}
    formTitle={'Parameters'}
    />
  </Window>