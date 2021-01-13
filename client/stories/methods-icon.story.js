import React, { useState } from 'react'
import { MethodsIcon } from '../src/components/icons'

export default { 
  title: 'Icons/MethodsIcon',
  component: MethodsIcon
}

export const MethodsIconStory = () => {
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
    <MethodsIcon {...props} />
  </div>
}