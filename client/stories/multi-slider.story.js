import React, { useState } from 'react'
import { MultiSlider } from '../src/components/input'

export default { 
  title: 'MultiSlider',
  component: MultiSlider
}

export const MultiSliderStory = () => {
  const [value, setValue] = useState([20, 40, 40])
  
  const handleChange = (e) => {
    setValue(e.currentTarget.value)
  }

  return <div style={{ width: '280px' }}>
    <MultiSlider value={value} onChange={handleChange} minValues={[20, 20, 20]} />
  </div>
}