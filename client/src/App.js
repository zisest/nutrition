import React, {useState, useEffect} from 'react'
import { Switch, Route, Redirect, Link, useLocation } from 'react-router-dom'
import MealPlanPage from './components/meal-plan-page'
import ModelsPage from './components/models-page'
import AuthModal from './components/auth-modal'
import './App.css'
import PreferencesPage from './components/preferences-page'
import Navbar from './components/navbar'

import { checkAuth, refreshToken, checkRefresh, deleteTokens } from './api/auth'

const jwtDecode = require('jwt-decode')

function App() {
  const location = useLocation()
  const [auth, setAuth] = useState(null)
  const [protectedRoute, setProtectedRoute] = useState(false)

  const protectedRoutes = ['/preferences', '/preferences/'] //, '/meal-plan', '/meal-plan/']
  
  useEffect(() => { //check auth
    let isAuth = checkAuth()
    console.log('isAuth', isAuth)    
    if (!isAuth) {
      if (!checkRefresh()) 
        setAuth(false)
      else refreshToken()
        .then((res) => {
          console.log('refreshToken: ', res)
          res.status === 200 && setAuth(true)
        })
        .catch(err => {
          console.error(err)
        })
    } else {
      setAuth(true)
    }        
  }, [])

  useEffect(() => { // test protected views
    fetch('/api/closed/',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
      }
    )
    .then(res => res.json())
    .then(res => {
      console.log('closed: ', res)
    })
  }, [])

  let authModal = protectedRoutes.includes(location.pathname) && !auth ? <AuthModal onAuth={(state) => setAuth(state)} /> : ''

  return (
    <div className='app'>
      <Navbar title='Nutrition helper' position='horizontal' size='70px' zIndex={100} stickToEnd={1} >
        <Link to='/models'>Models</Link>
        <Link to='/preferences'>Preferences</Link>
        <Link to='/meal-plan'>Meal plan</Link>
        <div onClick={() => {deleteTokens(); setAuth(false)}}>{auth && localStorage.getItem('username') || ''}</div>
      </Navbar>
      <div className="app_main">
      <Switch>
        <Route exact path='/' render={() => <Redirect to='/models' />} />
        <Route path='/models' component={ModelsPage} />
        <Route path='/preferences' render={() => <PreferencesPage auth={auth} onAuth={(state) => setAuth(state)} />} />
        <Route path='/meal-plan' render={() => <MealPlanPage />} />
        <Route render={() => <Redirect to='/' />} />
      </Switch>
      {authModal}
      </div>    
    </div>
  )
}

export default App
