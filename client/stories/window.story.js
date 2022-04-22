import React from 'react'
import Window from '../src/components/window'
import Form from '../src/components/form'

export default { 
  title: 'Window',
  component: Window
}

export const WindowStory = () => 
  <Window title={'Section'}>
    dadad
    dsfsf
  </Window>

export const BlankWindowStory = () => 
  <Window blank >
    dadad
    dsfsf
  </Window>