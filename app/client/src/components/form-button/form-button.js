import React from 'react'
import './form-button.css'
  
function FormButton({ submit, text, onClick, disabled, color, formHeight, className }) {
  let buttonStyle = 'form-button_btn__' + color

  let button = submit ?
    <input className={className + ' form-button_btn ' + buttonStyle} disabled={disabled} onClick={onClick} type='submit' value='' />      
  : 
    <button className={className + ' form-button_btn ' + buttonStyle} disabled={disabled} onClick={onClick}></button>

  return (
    <div className="form-button">
      {button}
    </div>    
  )


}
FormButton.defaultProps = {
  submit: false,
  text: 'Button',
  disabled: false,
  color: 'green',
  className: ''
}
  
export default FormButton
