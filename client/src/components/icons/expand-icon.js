import React from 'react'
import { useSpring, animated } from 'react-spring'
import './expand-icon.css'


function ExpandIcon({ isExpanded }) {
  const { x } = useSpring({ x: isExpanded? 1 : 0, config: { duration: 300 } })

  return (
    <div>
    <svg width="21" height="10" viewBox="0 0 21 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <animated.path fill="#9EABA5"
        d={x.interpolate({
          range: [0, 0.5, 1],
          output: [
            "M 1.8081 0 L 0 1.5167 L 10.1132 10 L 20.2264 1.5167 L 18.4183 0 L 10.1132 6.9666 Z",
            "M 0 3.828 L 0 6.148 L 10.113 6.148 L 20.227 6.148 L 20.227 3.828 L 10.113 3.828 Z ",
            "M 0 8.483 L 1.808 10 L 10.113 3.033 L 18.418 10 L 20.227 8.483 L 10.113 0 Z",
          ]
        })}
      />
    </svg>
    </div>
  )
}

ExpandIcon.defaultProps = {
}

export default ExpandIcon
