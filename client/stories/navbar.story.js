import React from 'react'
import Navbar from '../src/components/navbar'

export default { 
  title: 'Navbar',
  component: Navbar
}

export const NavbarStory = () => 
  <Navbar title='My name' stickToEnd={2} size='350px' >
    <div>a</div>
    <div>b</div>
    <div>c</div>
    <div>d</div>
    <div>e</div>
  </Navbar>

export const HorizStory = () => 
<Navbar position='horizontal' stickToEnd={2} size='80px' >
  <div>atresfds</div>
  <div>bsdfdf</div>
  <div>cfdfdf</div>
  <div>ddfd</div>
  <div>efdfdf</div>
</Navbar>