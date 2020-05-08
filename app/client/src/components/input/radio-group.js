import React from 'react'
import './radio-group.css'
import './input.css'
  
function RadioGroup({ name, label, options, value, onChange, validityErrors, displayErrors }) {
  let errorBorderStyle = validityErrors.length === 0 ? '' : ' radio-group_options__error'
  let errorLabelStyle = validityErrors.length === 0 ? '' : ' input_label__error'

  let radios = options.map((option, index) => {
    let selectedOptionStyle = (value === option.name) ? ' radio-group_option__selected' : ''
    return (
      <label className={'radio-group_option' + selectedOptionStyle} key={index}>            
        <input 
          type='radio'
          name={name}
          value={option.name}
          checked={value === option.name}
          onChange={onChange}
        />
        <div className='radio-group_label'>
          {option.label || option.name}
        </div> 
      </label>
    )
  })

  return (
    <div className='input'>
      <div className={'input_label' + errorLabelStyle}>
        {label || name}
      </div>      
      <div className={'radio-group_options' + errorBorderStyle}>
        {radios}
      </div>  
      <ul className="input_validity-errors">      
        {displayErrors && validityErrors.map((err, index) => <li className="input_validity-error" key={index}>{err}</li>)}
      </ul>
    </div>
  )
}
RadioGroup.defaultProps = {
  options: []
}
  
export default RadioGroup
