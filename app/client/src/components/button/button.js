import React from 'react'
import './button.css'
  
function Button({ submit, text, onClick, disabled, color, type, className }) {
  let buttonStyle = 'button__' + type + ' button__' + color
  return (
    submit ?
      <input className={className + ' button ' + buttonStyle} disabled={disabled} onClick={onClick} type='submit' value={text} />      
    : 
      <button className={className + ' button ' + buttonStyle} disabled={disabled} onClick={onClick}>{text}</button>
  )


}
Button.defaultProps = {
  submit: false,
  text: 'Button',
  disabled: false,
  color: 'green',
  type: 'primary',
  className: ''
}
  
export default Button
