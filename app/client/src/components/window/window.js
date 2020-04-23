import React from 'react'
import './window.css'
  
function Window({title, width, blank, children}) {
  let blankStyle = blank ? ' window__blank' : ''
  return (
    <div className={'window' + blankStyle} style={{ width }}>
      {!blank && <div className='window_title'>{title}</div>}
      <div className="window_body">{children}</div>      
    </div>
  )
}
Window.defaultProps = {
  blank: false
 }
  
export default Window
