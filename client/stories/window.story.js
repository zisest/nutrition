import React from 'react'
import Window from '../src/components/window'
import { ReactComponent as HelpIcon } from '../src/assets/help-icon.svg'

export default { 
  title: 'Window',
  component: Window
}

export const WindowStory = () =>
  <div style={{ padding: '50px', background: '#424242', display: 'flex', justifyContent: 'space-around' }}>
    <Window title='Параметры' width='310px' cornerIcon={<HelpIcon />}>
      dadad
      dsfsf
    </Window>
    <Window title='Параметры' width='310px' >
      dadad
      dsfsf
    </Window>
  </div>


export const BlankWindowStory = () => 
  <Window blank >
    dadad
    dsfsf
  </Window>