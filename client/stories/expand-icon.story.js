import React, { useState } from 'react'
import { ExpandIcon } from '../src/components/icons'

export default { 
  title: 'Icons/ExpandIcon',
  component: ExpandIcon
}

export const ExpandIconStory = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  let props = {
    isExpanded
  }

  return <div>
    <label>isExpanded <input type='checkbox' onChange={() => setIsExpanded(prev => !prev)} /></label>
    <br />
    <ExpandIcon {...props} />
  </div>
}