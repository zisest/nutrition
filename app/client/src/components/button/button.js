import React from 'react'
import './button.css'
  

const types = {
  'form': ' form-button',
  'corner': ' corner-button'
}
//  corner only for coren-button
function Button({ type, corner, submit, text, onClick, disabled, color, formHeight, className }) {
  let buttonColorStyle = types[type] + '_btn__' + color
  let cornerStyle = corner ? '__' + corner : ''
  let buttonCornerStyle = corner ? types[type] + '_btn' + cornerStyle : ''

  let button = submit ?
    <input className={className + types[type] + '_btn' + buttonColorStyle + buttonCornerStyle} disabled={disabled} onClick={onClick} type='submit' value={text} />      
  : 
    <button className={className + types[type] + '_btn' + buttonColorStyle + buttonCornerStyle} disabled={disabled} onClick={onClick}>{text}</button>

  return (
    <div className={types[type] + types[type] + cornerStyle}>
      {button}
    </div>    
  )


}
Button.defaultProps = {
  type: 'form',
  submit: false,
  corner: '',
  text: '',
  disabled: false,
  color: 'green',
  className: ''
}
  
export default Button
