import React, {useState} from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import InputPage from './components/input-page'
import ResultsPage from './components/results-page'
import './App.css'

function App() {
  const [auth, setAuth] = useState(null)
  return (
    <div className='app'>
      <Switch>
        <Route exact path='/' component={InputPage} />
        <Route path='/res' component={ResultsPage} />
        <Route render={() => <Redirect to='/' />} />
      </Switch>
    </div>
  )
}

export default App
