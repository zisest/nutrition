import React from 'react'
import Input from '../src/components/input'
import { RadioGroup, Select } from '../src/components/input'
import Form from '../src/components/form'

export default { 
  title: 'Input',
  component: Input
}

const field = {name: 'field1', label: 'field uno', regex: /^-?([0-9]+([.][0-9]*)?|[.][0-9]+)$/}
const radioG = {
  type: 'radio',
  initialValue: 'm',
  name: 'gender',
  label: 'Gender',
  options: [
    {name: 'm', label: 'male'},
    {name: 'f', label: 'female'},
    {name: 'l', label: 'female'},
  ]
}
const formed = [radioG]

const select = {
    type: 'select',
    name: 'radio1',
    required: true,
    options: [{name: 'opt1', label: 'Option 1'}, {name: 'opt2', label: 'Option 2'}],
    required: true,
    initialValue: 'opt2'
  }





export const textInput = () => 
  <div style={{width: '300px'}}>
    <Input {...field} validityErrors={['sasas', 'DEDJEF FEfEF']} />
    <Input {...field} validityErrors={['sasas', 'DEDJEF FEfEF']} />
    <RadioGroup {...radioG}  />
  </div>

export const inForm = () => 
  <Form 
  fields={formed} 
  submitText={'Predict'}
  formTitle={'Parameters'}
   /> 

export const selectStory = () => 
  <div style={{ width: '300px' }}>
    <Select {...select} />
  </div>