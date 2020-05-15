import React from 'react'
import DataSquare from '../src/components/data-square'

export default { 
  title: 'DataSquare',
  component: DataSquare
}

let data = {
  name: 'name',
  label: 'Title',
  value: 6.25,
  unit: {
    name: 'kg',
    accuracy: 1
  },
  alternativeUnits: [
    { name: 'g', rate: 1000, accuracy: 0.01 }
  ]  
}

export const DataSquareStory = () => 
  <div style={{width: '150px', height: '160px'}}>
    <DataSquare {...data} />
  </div>