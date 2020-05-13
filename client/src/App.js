import React, {useState, useEffect} from 'react'
import { Switch, Route, Redirect, Link } from 'react-router-dom'
import HomePage from './components/home-page'
import ModelsPage from './components/models-page'
import AuthModal from './components/auth-modal'
import './App.css'
import PreferencesPage from './components/preferences-page'
import Navbar from './components/navbar'

import { checkAuth, refreshToken, checkRefresh } from './api/auth'

const jwtDecode = require('jwt-decode')

function App() {
  const [auth, setAuth] = useState(null)

   
  useEffect(() => { //check auth
    let isAuth = checkAuth()
    console.log('isAuth', isAuth)
    
    if (!isAuth) {
      if (!checkRefresh()) setAuth(false)
      else refreshToken().then((res) => {
        console.log('status: ', res)
        res.status === 200 && setAuth(true)
      })
    } else {
      setAuth(true)
    }
    
    
  }, [])

  return (
    <div className='app'>
      <Navbar title='Nutrition helper' position='horizontal' size='70px' >
        <Link to='/models'>Models</Link>
        <Link to='/preferences'>Preferences</Link>
        <Link to='/models'>Meal plan</Link>
      </Navbar>
      <div className="app_main">
      <Switch>
        <Route exact path='/' render={() => <Redirect to='/models' />} />
        <Route path='/models' component={ModelsPage} />
        <Route path='/preferences' component={PreferencesPage} />
        <Route path='/auth' component={AuthModal} />
        <Route render={() => <Redirect to='/' />} />
      </Switch>
      </div>     
    </div>
  )
}

export default App
