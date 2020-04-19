import React from 'react'
import Button from '../src/components/button'

export default { 
  title: 'Button',
  component: Button
}

export const ButtonStory = () => 
  <div style={{display: 'flex', justifyContent: 'space-around', width: '50%'}}>
    <Button />
    <Button color='violet' />
    <Button type='secondary' />
    <Button color='violet' type='secondary' />
    <Button color='violet' type='secondary' disabled />
    <Button color='green' type='primary' disabled />
  </div>
export const SubmitStory = () => <Button submit />