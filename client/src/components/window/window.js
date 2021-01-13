import React from 'react'
import './window.css'
import { ReactComponent as EmptyIcon } from '../../assets/empty-icon.svg'
  
function Window({title, width, blank, children, className, style, empty, emptyText, cornerIcon, onCornerIcon }) {
  let blankStyle = blank ? ' window__blank' : ''

  let emptyWindow = (
    <div className={'window window__empty' + ' ' + className} style={{ width, ...style}}>
      {title && <div className='window_title'><h2>{title}</h2></div>}
      <div className="window_body">        
        <div className="window__empty-icon"><EmptyIcon /></div>
        <div className="window__empty-text">{emptyText.split('\\').map(line => <>{line}<br/></>)}</div>
      </div>      
    </div>
  )
  if (empty) return emptyWindow

  return (
    <div className={'window' + blankStyle + ' ' + className} style={{ width, ...style}}>
      {!blank && title && <div className='window_title'><h2>{title}</h2></div>}
      <div className="window_body">{children}</div>
      {cornerIcon && <div className='window_corner-icon' onClick={onCornerIcon}>{cornerIcon}</div>}
    </div>
  )
}
Window.defaultProps = {
  blank: false,
  style: {},
  empty: false,
  emptyText: 'Здесь ничего нет.',
  className: ''
 }
  
export default Window
