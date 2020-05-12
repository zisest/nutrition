import React, { useState, useEffect } from 'react'
import './slider.css'
import './input.css'
  

// only works with options
// double sized
function Slider({ name, label, options, value, onChange, double }) {
  const [intValue, setIntValue] = useState(0)

  useEffect(() => {
    setIntValue(options.findIndex(option => option.name === value))
  }, [value])

  const handleOptionChange = (e) => {
    let value = options[e.currentTarget.value].name
    onChange({ currentTarget: { value, name, type: 'slider' }})
  }
  


  return(
    <div className="input" >
      <div className="input_label">{label}</div>
      <div className="slider_container">
        <div className='slider' >
          <input 
            type='range' 
            value={intValue} 
            onChange={handleOptionChange} 
            min={0} 
            max={options.length - 1} 
            step={1} 
          />
        </div>
        <div className="slider_info">
          {options[intValue] && options[intValue].label}
          <div className="slider_info-detailed">
            {options[intValue] && options[intValue].description}
          </div>
        </div>
      </div>      
    </div>
  )
}


Slider.defaultProps = {
  options: []
}

export default Slider