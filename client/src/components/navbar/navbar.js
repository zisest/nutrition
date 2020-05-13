import React from 'react'
import './navbar.css'
  
function Navbar({ title, size, position, children, stickToEnd, zIndex }) {
  
  let childrenArray = React.Children.toArray(children).map((child, index) => 
    <div key={index} className='navbar_child'>{child}</div>
  )
  let atStart = childrenArray.slice(0, childrenArray.length - stickToEnd)
  let atEnd = childrenArray.slice(childrenArray.length - stickToEnd)

  let sizeStyle = size && position === 'vertical' ? { width: size } : { height: size }

  return (
    <div style={{ ...sizeStyle, zIndex }} className={`navbar navbar__${position}`}>
      <div className='navbar_header'>
        <div className="navbar_title">{title}</div> 
        <div className='navbar_divider'></div>
      </div>
      <div className='navbar_body'>
        <div className='navbar_children'>{atStart}</div>
        <div className='navbar_children__end'>{atEnd}</div>
      </div>
    </div>
  )
}
Navbar.defaultProps = {
  position: 'vertical',
  stickToEnd: 0,
  title: 'Navbar',
  zIndex: null
}
  
export default Navbar
