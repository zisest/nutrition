import React, { Fragment } from 'react'
import './multi-button.css'
  
function MultiButton({ color, children, className }) {
  let colorClass = color ? ' multi-button__' + color : ''
  let propsClass = className ? ' ' + className : ''

  let verticalLine = <div className='multi-button_divider'></div>

  let buttons = children.map((btn, idx) => {
    let isString = typeof(btn) === 'string'
    let isLastChild = idx === children.length - 1

    return <Fragment key={idx}>
      {isString ? <div className='multi-button_text'>{btn}</div> : btn}
      {!isLastChild && verticalLine}
    </Fragment>
  })

  return (
    <div className={'multi-button' + colorClass + propsClass}>
      {buttons}
    </div>
  )
}
MultiButton.defaultProps = {
  color: '',
  className: ''
}
  
export default MultiButton
