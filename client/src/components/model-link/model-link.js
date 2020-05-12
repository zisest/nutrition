import React from 'react'
import './model-link.css'
import { NavLink, useRouteMatch } from 'react-router-dom'

function ModelLink({ name, title, description, to, exact }) {
  /*
  let match = useRouteMatch({
    path: to,
    exact: activeWhenExact
  })*/
  //let activeLinkStyle = match ? ' model-link__active' : ''
  return (
    <NavLink to={to} activeClassName='model-link__active' className='model-link' exact={exact}>           
      <div className='model-link_name'>
        {title}
      </div>
      <div className='model-link_description'>
        {description}
      </div>          
    </NavLink>
  )
}
ModelLink.defaultProps = {
  exact: false
}
  
export default ModelLink
