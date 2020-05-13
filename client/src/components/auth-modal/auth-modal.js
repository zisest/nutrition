import React, { useState, useEffect } from 'react'
import './auth-modal.css'
import Login from '../login'  
import Register from '../register'

import { setTokenPair } from '../../api/auth'

const FETCH_FORMS_URL = '/api/get_forms/?forms=register,login'


function AuthModal({ onAuth }) {
  const [forms, setForms] = useState(null)
  const [state, setState] = useState('login')
  const [username, setUsername] = useState(null)

  useEffect(() => {
    fetch(FETCH_FORMS_URL)
    .then(res => res.json())
    .then(res => {
      setForms(res)
    })
    .catch(err => console.error('ERROR: ', err))
  }, [])

  const handleRegistration = (user) => {
    setUsername(user)
    setState('login')
  }
  const handleLogin = (tokens, user) => {
    setTokenPair(tokens)
    localStorage.setItem('username', user)
  }


  let login = forms && <Login onSuccess={handleLogin} username={username} form={forms.login} />
  let register = forms && <Register onSuccess={handleRegistration} form={forms.register} />
  return (
    <div className='auth-modal'>

      {state === 'login' ? login : register}
    </div>
  )
}
AuthModal.defaultProps = { }
  
export default AuthModal
