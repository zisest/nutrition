import React, { useState, useEffect } from 'react'
import './auth-modal.css'
import Login from '../login'  
import Register from '../register'
import Window from '../window'

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
    onAuth()
  }


  let login = forms && <Login onSuccess={handleLogin} username={username} form={forms.login} />
  let register = forms && <Register onSuccess={handleRegistration} form={forms.register} />
  let titleBlock = state === 'login' ? 
    <Window width='500px' title='New user?' style={{ marginBottom: '15px' }}>
      Click <span onClick={() => setState('register')} className='auth-modal_link'>here</span> to register
    </Window>
  :
    <Window width='500px' title='Already have an account?' style={{ marginBottom: '15px' }}>
      Click <span onClick={() => setState('login')} className='auth-modal_link'>here</span> to login
    </Window>
  
  return (
    <div className='auth-modal_container'>
      <div className="auth-modal">
        {titleBlock}
        <Window blank width='500px' >{state === 'login' ? login : register}</Window>
      </div>
    </div>
  )
}
AuthModal.defaultProps = { }
  
export default AuthModal
