import React, { useState } from 'react'
import './multi-slider.css'
  
// minValues: [10, 20, 40] - minimal % values segments can have
function MultiSlider({ minValues, value, onChange, name, label, segmentLabels }) {  
  
  //             newVal1      newVal2
  // |--------------*------------*-------------|
  //     value[0]       value[1]     value[2]

  const handleKnob1 = (e) => {
    let newVal1 = Number(e.target.value)
    if (newVal1 >= minValues[0]) {
      if (100 - value[2] - newVal1 >= minValues[1])         
        onChange({ currentTarget: {
           value: [newVal1, 100 - value[2] - newVal1, value[2]],
           name, 
           type: 'multi-slider'
        }})      
      else if (100 - (newVal1 + minValues[1]) >= minValues[2]) 
        // One knob moving another if possible        
        onChange({ currentTarget: {
          value: [newVal1, minValues[1], 100 - newVal1 - minValues[1]],
          name, 
          type: 'multi-slider'
        }})      
    }    
  }

  const handleKnob2 = (e) => {
    let newVal2 = Number(e.target.value)
    if (100 - newVal2 >= minValues[2]) {
      if (newVal2 - value[0] >= minValues[1])         
        onChange({ currentTarget: {
          value: [value[0], newVal2 - value[0], 100 - newVal2],
          name, 
          type: 'multi-slider'
        }})      
      else if (newVal2 - minValues[1] >= minValues[0]) 
        // One knob moving another if possible
        onChange({ currentTarget: {
          value: [newVal2 - minValues[1], minValues[1], 100 - newVal2],
          name, 
          type: 'multi-slider'
        }})      
    }
  }

  return (
    <div className='input'>
      <div className='input_label'>{label || name}</div>
      <div className="milti-slider_container">
        <div className="multi-slider_wrapper">
          <div className="multi-slider">
            <div className="multi-slider_track"></div>
            <input className="multi-slider_input-tag" type='range' min='0' value={value[0]} max='100' onChange={handleKnob1} />
            <input className="multi-slider_input-tag" type='range' min='0' value={value[0] + value[1]} max='100' onChange={handleKnob2}/>
          </div>        
        </div>
        <div className="multi-slider_info">
          <div className="multi-slider_info-column">
            <div className="multi-slider_info-label">{segmentLabels[0]}</div>
            <div className="multi-slider_info-value">{value[0]}%</div>
          </div>
          <div className="multi-slider_info-column">
            <div className="multi-slider_info-label">{segmentLabels[1]}</div>
            <div className="multi-slider_info-value">{value[1]}%</div>
          </div>
          <div className="multi-slider_info-column">
            <div className="multi-slider_info-label">{segmentLabels[2]}</div>
            <div className="multi-slider_info-value">{value[2]}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
MultiSlider.defaultProps = {
  minValues: [10, 10, 10],
  value: [20, 30, 50],
  label: 'slider',
  segmentLabels: ['Segment 1', 'Segment 2', 'Segment 3']
 }
  
export default MultiSlider
