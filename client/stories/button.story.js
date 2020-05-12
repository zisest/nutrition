import React from 'react'
import Button from '../src/components/button'

export default { 
  title: 'Button',
  component: Button
}

export const ButtonStory = () => <div style={{padding: '20px', display: 'flex', justifyContent: 'space-around'}}> 
  <div style={{height: '200px'}}><Button type='form' /></div>
  <div style={{height: '200px'}}><Button submit type='form' /></div>
  <div style={{width: '270px', height: '50px'}}><Button submit corner='bottom-right' text='Generate meal plan' type='corner' /></div>
  <div style={{width: '150px', height: '50px'}}><Button submit corner='bottom-left' color='violet' type='corner' /></div>
  <div style={{width: '150px', height: '50px'}}><Button submit corner='top-right'type='corner' /></div>
  <div style={{width: '150px', height: '50px'}}><Button submit corner='top-left' type='corner' /></div>
</div>
