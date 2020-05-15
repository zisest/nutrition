import React from 'react'
import './data-square.css'
  
// {name, label, value, unit: {name, accuracy}, alternativeUnits: [{name, rate, accuracy }] }
function DataSquare({ name, label, value, unit, alternativeUnits }) {

  let mainField = <div className="data-square_field">{value.toFixed(unit.accuracy) + ' ' + unit.name}</div>

  let fields = alternativeUnits.map((unit, index) => (
    <div className="data-square_field" key={index} >{(value*unit.rate).toFixed(unit.accuracy) + ' ' + unit.name}</div>
  ))

  return (
    <div className='data-square'>
      <div className='data-square_title'>{label || name}</div>
      <div className='data-square_fields'>{[mainField, ...fields]}</div>                
    </div>
  )
}
DataSquare.defaultProps = {
  label: 'Title',
  value: 6,
  unit: {
    name: 'kg',
    accuracy: 1
  },
  alternativeUnits: []  
 }
  
export default DataSquare
