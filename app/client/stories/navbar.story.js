import React from 'react'
import Navbar from '../src/components/navbar'

export default { 
  title: 'Navbar',
  component: Navbar
}

export const NavbarStory = () => 
  <Navbar stickToEnd={2}>
    <div>a</div>
    <div>b</div>
    <div>c</div>
    <div>d</div>
    <div>e</div>
  </Navbar>

export const HorizStory = () => 
<Navbar position='horizontal' stickToEnd={2}>
  <div>atresfds</div>
  <div>bsdfdf</div>
  <div>cfdfdf</div>
  <div>ddfd</div>
  <div>efdfdf</div>
</Navbar>