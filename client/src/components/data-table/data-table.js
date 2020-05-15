import React from 'react'
import './data-table.css'
  
const leaders = {
  dots: ' data-table_field-leader__dots',
  centeredDots: ' data-table_field-leader__centered-dots',
  none: ''
}
const sizes = {
  small: ' data-table__small',
  normal: '',
  large: ' data-table__large'
}

// fields: [{ name, label, value, unit: { name, accuracy } }]
function DataTable({ name, fields, size, leader, separator, colorScheme }) {
  let dataFields = fields.map((field, index) => (
    <li className="data-table_field" key={index} >
      <div className="data-table_field-name">{field.label || field.name}</div>
      <div className={"data-table_field-leader" + leaders[leader]}></div>
      <div className="data-table_field-value">{(field.value).toFixed(field.unit.accuracy)}</div>
      <div className="data-table_field-unit">{field.unit.name}</div>
    </li>
  ))

  return (
    <ul className={'data-table' + sizes[size]}>
      {dataFields}
    </ul>
  )
}

DataTable.defaultProps = {
  fields: [],
  size: 'normal',
  leader: 'dots',
  separator: 'none',
  colorScheme: 'main'
}
  
export default DataTable
