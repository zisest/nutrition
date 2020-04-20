import React from 'react'
import './input.css'

function Input({ type, value, name, label, disabled, validityErrors, onChange, placeholder, maxLength, displayErrors }) {
  let errorBorderStyle = validityErrors.length === 0 ? '' : ' input_input-tag__error'
  let errorLabelStyle = validityErrors.length === 0 ? '' : ' input_label__error'
  return (
    <div className='input'>
      <label className='input_label-tag'>
        <div className={'input_label' + errorLabelStyle}>{label}</div> 
        <input className={'input_input-tag' + errorBorderStyle}
          type='text'
          name={name}
          value={value}
          placeholder={placeholder || name}
          disabled={disabled} 
          onChange={onChange}
          maxLength={maxLength}
        />
      </label>
      <ul className="input_validity-errors">      
        {displayErrors && validityErrors.map((err, index) => <li className="input_validity-error" key={index}>{err}</li>)}
      </ul>
    </div>
  )
}

Input.defaultProps = {
  type: 'text',
  value: '',
  name: 'Text',
  disabled: false
}

export default Input
