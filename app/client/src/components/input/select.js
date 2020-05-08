import React, { useState } from 'react'
import './select.css'
import './input.css'
  
function Select({ name, label, options, value, onChange, double, validityErrors, displayErrors }) {
  const [isExpanded, setIsExpanded] = useState(false)

  let doubleSizeStyle = double ? ' select__double' : ''
  let doubleSizeDropdownStyle = double ? ' select_dropdown__double' : ''


  const handleExpand = (e) => {
    setIsExpanded(prev => !prev)
  }
  const handleSelect = (e) => {
    let value = e.currentTarget.id
    onChange({ currentTarget: { value, name, type: 'select' }})
  }
/*
  document.addEventListener('click', (e) => {
    !document.querySelector('div.input.input__select').contains(e.target) && setIsExpanded(false)
  })
*/
  let selected = options.filter(option => option.name === value).map((option, index) => (      
    <div id={option.name} className="select_option" key={index} >
      <div className="select_option-label">{option.label}</div>
      <div className="select_option-description">{option.description}</div>
    </div>
  ))  
  let selectable = options.filter(option => option.name !== value).map((option, index) => (      
    <div id={option.name} className="select_option" onClick={handleSelect} key={index} >
      <div className="select_option-label">{option.label}</div>
      <div className="select_option-description">{option.description}</div>
    </div>
  ))  

  let dropdown = <div className={'select_dropdown' + doubleSizeDropdownStyle}>    
    {selected}
    {selectable}
  </div>


  return(
    <div className="input input__select" onClick={handleExpand} >
      <div className="input_label">{label}</div>
      <div className={'select' + doubleSizeStyle} name={name}>
        {selected}
      </div>
      <div className="select_dropdown-container">
        {isExpanded && dropdown}
      </div>
    </div>
  )
}

export default Select