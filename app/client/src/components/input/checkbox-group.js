import React from 'react'
import './radio-group.css'
import './input.css'
import './checkbox-group.css'
  

// layout.length should be either 1 or 3
function CheckboxGroup({ name, label, options, value, onChange, validityErrors, displayErrors, layout }) {
  let errorBorderStyle = validityErrors.length === 0 ? '' : ' radio-group_options__error'
  let errorLabelStyle = validityErrors.length === 0 ? '' : ' input_label__error'
  let doubleSizeStyle = layout.length === 3 ? ' checkbox-group_options__double' : ''

  const handleChange = (e) => {
    let values = new Set(value)
    if (e.target.checked) 
      values.add(e.target.name)
    else
      values.delete(e.target.name)
    onChange({ currentTarget: { value: [...values], name, type: 'checkbox' }})
  }

  if(!(layout.length === 1 || layout.length === 3))
    throw new Error('layout.length should be 1 or 3')

  let radios = options.map((option, index) => {
    let selectedOptionStyle = (value && value.includes(option.name)) ? ' radio-group_option__selected' : ''
    return (
      <label className={'radio-group_option' + selectedOptionStyle} key={index}>            
        <input 
          type='checkbox'
          name={option.name}
          checked={value && value.includes(option.name)}
          onChange={handleChange}
        />
        <div className='radio-group_label'>
          {option.label || option.name}
        </div> 
      </label>
    )
  })

  let rows = layout.map(val => (
    <div className="checkbox-group_options-row">
      {radios.splice(0, val)}
    </div>
  ))
  

  return (
    <div className='input'>
      <div className={'input_label' + errorLabelStyle}>
        {label || name}
      </div>  
      <div className={'radio-group_options checkbox-group_options' + errorBorderStyle + doubleSizeStyle}>
        {rows}
      </div>  
      <ul className="input_validity-errors">      
        {displayErrors && validityErrors.map((err, index) => <li className="input_validity-error" key={index}>{err}</li>)}
      </ul>
    </div>
  )
}
CheckboxGroup.defaultProps = {
  options: [],
  validityErrors: [],
  layout: [5]
}
  
export default CheckboxGroup
