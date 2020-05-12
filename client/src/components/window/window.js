import React from 'react'
import './window.css'
  
function Window({title, width, blank, children, className}) {
  let blankStyle = blank ? ' window__blank' : ''
  return (
    <div className={'window' + blankStyle + ' ' + className} style={{ width }}>
      {!blank && <div className='window_title'><h2>{title}</h2></div>}
      <div className="window_body">{children}</div>      
    </div>
  )
}
Window.defaultProps = {
  blank: false
 }
  
export default Window
