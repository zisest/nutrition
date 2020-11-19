import React from 'react'
import './simple-button.css'
  
function SimpleButton({ children, color, isIcon, withFlatSide, onClick }) {
  let colorClass = color ? ' simple-button__' + color : ''
  let flatSidesClass = withFlatSide ? ' simple-button__flat-' + withFlatSide : ''
  let isIconClass = isIcon ? ' simple-button__icon' : ''

  let className = 'simple-button' + colorClass + flatSidesClass + isIconClass

  return (
    <button className={className} onClick={onClick} >
      { children }
    </button>
  )
}
SimpleButton.defaultProps = {
  children: 'Кнопка',
  color: '', // green by default
  withFlatSide: false, // 'left', 'right', 'both'
  isIcon: false
}
  
export default SimpleButton
