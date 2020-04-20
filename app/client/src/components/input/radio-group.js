import React from 'react'
import './radio-group.css'
import './input.css'
  
function RadioGroup({ name, label, options, value, onChange }) {
  

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
      <div className='input_label'>
        {label || name}
      </div>      
      <div className='radio-group_options'>
        {radios}
      </div>  
    </div>
  )
}
RadioGroup.defaultProps = {
  options: []
}
  
export default RadioGroup
