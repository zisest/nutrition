import React, { useState, useEffect } from 'react'
import Form from '../form'
import './register.css'
  
const REGISTER_URL = '/api/auth/create/'

function Register({ form, onSuccess }) {
  //const [status, setStatus] = useState(null)
  const [errors, setErrors] = useState([])  

  
  const handleResponse = (req, res, status) => {
    if (res.username) {
      //setStatus(res.username)
      setErrors([])
      onSuccess(res.username)
    } else setErrors(res)
  }


  let registrationForm = form ? <Form
    columns={1} 
    singleErrorList={false}
    submitUrl={REGISTER_URL}
    fields={form} 
    formTitle={'Регистрация'}
    onResponse={handleResponse}
    errorsToDisplay={errors.map(err => err.error)}
    onFieldChange={() => setErrors([])}
  /> : ''


  return (
    <div className='register'>
      {registrationForm}
    </div>
  )
}
Register.defaultProps = { }
  
export default Register
