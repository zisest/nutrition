import React, { useState } from 'react'
import './login.css'
import Form from '../form'
  
const LOGIN_URL = '/api/auth/get_token/'

function Login({ form, username, onSuccess }) {
  const [errors, setErrors] = useState([])  

  const handleResponse = (req, res) => {
    console.log(res)
  }

  let loginForm = form ? <Form
    columns={1} 
    singleErrorList={false}
    submitUrl={LOGIN_URL}
    fields={form} 
    formTitle={'Login'}
    onResponse={handleResponse}
    errorsToDisplay={errors.map(err => err.error)}
  /> : ''

  return (
    <div className='login'>
      {loginForm}
    </div>
  )
}
Login.defaultProps = {
  username: null
}
  
export default Login
