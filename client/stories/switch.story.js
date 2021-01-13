import React, { useState } from 'react'
import { Switch } from '../src/components/input'

export default { 
  title: 'Switch',
  component: Switch
}

export const SwitchStory = () => {
  const [state, setState] = useState(false)


  return <div>
    <Switch value={state} onChange={(e) => setState(e.target.checked)} label='Switch name' name='switch' /><br/>
    <Switch value={!state} onChange={(e) => setState(!e.target.checked)} label='Switch name' name='switch' /><br/>
    <Switch value={state} onChange={(e) => setState(e.target.checked)} label='Switch name' name='switch' />
  </div>
}