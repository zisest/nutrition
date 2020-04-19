import React from 'react'
import Input from '../src/components/input'

export default { 
  title: 'Input',
  component: Input
}

const field = {name: 'field1', label: 'field uno', regex: /^-?([0-9]+([.][0-9]*)?|[.][0-9]+)$/}
export const textInput = () => 
  <div>
    <Input {...field} validityErrors={['sasas', 'DEDJEF FEfEF']} />
    <Input {...field} validityErrors={['sasas', 'DEDJEF FEfEF']} />
  </div>