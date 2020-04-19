import React from 'react'
import Form from '../src/components/form'
import Input from '../src/components/input'

export default { 
  title: 'Form',
  component: Form
}

const SOURCE_FIELDS = ['insulin', 'glucose', 'TC', 'HDL-C', 'TG', 'LDL-C', 'age', 'sex_f', 'sex_m']
const MAPPED = SOURCE_FIELDS.map(label => ({
  name: label,
  label,
  regex: /^-?([0-9]+([.][0-9]*)?|[.][0-9]+)$/,
  required: true,
  maxLength: 5
}))

export const FormStory = () => <Form columns={2} 
  submitUrl='/api/predict' 
  fields={MAPPED} 
  submitText={'Predict'}
  formTitle={'Parameters'}
   />