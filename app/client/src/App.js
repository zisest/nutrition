import React, {useState} from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import HomePage from './components/home-page'
import ModelsPage from './components/models-page'
import './App.css'

function App() {
  const [auth, setAuth] = useState(null)
  return (
    <div className='app'>
      <Switch>
        <Route exact path='/' component={HomePage} />
        <Route path='/models' component={ModelsPage} />
        <Route render={() => <Redirect to='/' />} />
      </Switch>
    </div>
  )
}

export default App
