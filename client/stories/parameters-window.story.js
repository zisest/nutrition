import React from 'react'
import ParametersWindow from '../src/components/parameters-window'

export default { 
  title: 'ParametersWindow',
  component: ParametersWindow,
  parameters: {
    layout: 'fullscreen'
  }
}

export const ParametersWindowStory = () =>
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#424242',
    width: '100%',
    height: '100%'
  }}>
    <ParametersWindow />
  </div>