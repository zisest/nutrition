import React from 'react'
import FormButton from '../src/components/form-button'

export default { 
  title: 'FormButton',
  component: FormButton
}

export const FormButtonStory = () => <div>
  <div style={{height: '200px'}}><FormButton text='d' /></div>
  <div style={{height: '200px'}}><FormButton submit text='d' /></div>
</div>
