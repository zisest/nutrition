import React from 'react'
import './methods-button.css'

// isExpanded: methods menu expanded - arrow icon is turned 180deg
// isNonDefault: non default method selected - methods icon is different color
function MethodsButton({ isExpanded, isNonDefault }) {
  let buttonClass = 'methods-button' + (isNonDefault ? ' methods-button__non-default' : '')
  let arrowClass = 'methods-button_arrow' + (isExpanded ? ' methods-button_arrow__expanded' : '')

  return (
    <div className={buttonClass}>    
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="27" viewBox="0 -3 25 27" >
      <path d="M22.587 19.2491H0V21.938H22.587V19.2491Z M22.587 10.7486H0V13.4375H22.587V10.7486Z M8.50049 2.24809H0V4.93702H8.50049V2.24809Z"/>
      <path className={arrowClass} d="M23.1158 0.117607L24.8836 1.88537L19.2387 7.53024C18.9177 7.91185 18.4533 8.13257 17.9156 8.13257C17.3862 8.13257 16.9294 7.91518 16.6085 7.54377L10.9458 1.88105L12.7136 0.113281L17.9169 5.31657L23.1158 0.117607Z"/>
    </svg>
    </div>
  )
}
MethodsButton.defaultProps = {
  isNonDefault: false,
  isExpanded: false
}
  
export default MethodsButton
