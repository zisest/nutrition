import React from 'react'
import './data-square.css'
  
function DataSquare({ title, values }) {

  let fields = values.map((value, index) => (
    <div className="data-square_field" key={index} >{value}</div>
  ))

  return (
    <div className='data-square'>
      <div className='data-square_title'>{title}</div>
      <div className='data-square_fields'>{fields}</div>                
    </div>
  )
}
DataSquare.defaultProps = {
  title: 'Title',
  values: ['10 in','25.4 cm']
 }
  
export default DataSquare
