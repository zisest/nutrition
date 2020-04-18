import React from 'react'
import './input.css'

function Input({type, value, placeholder, isDisabled, isValid}) {
  return (
    <div className='input'>
      <input type={type} value={value} placeholder={placeholder} disabled={isDisabled}></input>
    </div>
  )
}

Input.defaultProps = {
  type: 'text',
  value: 'some text',
  placeholder: 'placehodler'
}

export default Input
