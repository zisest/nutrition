import React from 'react'
import Form from '../src/components/form'
import Input  from '../src/components/input'

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
      options: label.map(option => ({name: option.split('_')[1]}))
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
console.log(MAPPED)

export const FormStory = () => <Form columns={2} 
  dataToSend={{MODEL_NAME: 'PredictingLBM1'}}
  submitUrl='/api/predict' 
  fields={MAPPED} 
  submitText={'Predict'}
  formTitle={'Parameters'}
   />