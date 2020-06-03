import React, { useState, useEffect } from 'react'
import './login.css'
import Form from '../form'

import { AUTH_GET_TOKEN_ERRORS } from '../../errors'

const LOGIN_URL = '/api/auth/get_token/'



function Login({ form, username, onSuccess }) {
  const [errors, setErrors] = useState([])  
  const [fields, setFields] = useState(null)

  const handleResponse = (req, res, status) => {
    if (status === 200) {
      setErrors([])
      onSuccess(res, req.username)
    } else setErrors([{ errID: status, error: AUTH_GET_TOKEN_ERRORS[status] }])
  }

  useEffect(() => {
    let user = username || localStorage.getItem('username') || null
    setFields(user ? form.map(field => (field.name === 'username' ? {...field, initialValue: user} : field)) : form)
  }, [])


  //let fields = username ? form.map(field => (field.name === 'username' ? {...field, initialValue: username} : field)) : form
  let loginForm = fields ? <Form
    columns={1} 
    singleErrorList={false}
    submitUrl={LOGIN_URL}
    fields={fields} 
    formTitle={'Войти в аккаунт'}
    onResponse={handleResponse}
    errorsToDisplay={errors.map(err => err.error)}
    onFieldChange={() => setErrors([])}
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
