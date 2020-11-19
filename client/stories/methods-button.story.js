import React, { useState } from 'react'
import MethodsButton from '../src/components/methods-button'

export default { 
  title: 'MethodsButton',
  component: MethodsButton
}

export const MethodsButtonStory = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isNonDefault, setIsNonDefault] = useState(false)

  let props = {
    isExpanded,
    isNonDefault
  }

  return <div>
    <label>isExpanded <input type='checkbox' onChange={() => setIsExpanded(prev => !prev)} /></label>
    <br />
    <label>isNonDefault <input type='checkbox' onChange={() => setIsNonDefault(prev => !prev)} /></label>
    <MethodsButton {...props} />
  </div>
}