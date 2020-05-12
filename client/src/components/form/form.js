import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import Input, { RadioGroup, Select, Slider, CheckboxGroup } from '../input'
import Button from '../button'
import './form.css'
  
const VALIDATION_ERRORS = { // '-p' is for errors with parameters (like min length)
  0: 'This field should not be empty',  
  '1-p': p => `The value should be at least ${p} characters long`
}
const VALIDATION_ERRORS_ALL = {
  0: 'Required fields should not be empty',
  '1-p': p => `Value(s) of some field(s) is not long enough`
}

//change to useEffect 
function Form({ fields, formTitle, submitText, submitUrl, columns, singleErrorList, dataToSend, headers, width, onResponse }) {
  const [cookies, setCookie] = useCookies()
  const [values, setValues] = useState({})
  const [validityErrors, setValidityErrors] = useState({})
  let regexs = fields.reduce((ac, field) => ({...ac, [field.name]: RegExp(field.regex) || /[\s\S]*/}), {})
  let required = fields.reduce((ac, field) => ({...ac, [field.name]: !!field.required}), {})
  let withMinLength = fields.reduce((ac, field) => ({...ac, [field.name]: field.minLength || 0}), {})

  useEffect(() => {
    let initValues = fields.reduce((ac, field) => ({...ac, [field.name]: field.initialValue || ''}), {})
    let initValidityErrors = fields.reduce((ac, field) => ({...ac, [field.name]: {}}), {})
    setValues(initValues)
    setValidityErrors(initValidityErrors)
  }, [fields])

  const setValidityError = (fieldName, errID, errState, errParam=null) => {
    setValidityErrors(prev => 
      ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        [errID]: [errState, errParam]
      }
      })
    )
  }

  const matchesRegex = (fieldName, value) => (value === '' || regexs[fieldName].test(value))
  const requiredFieldCheck = (fieldName, value) => {
    let isError = (value === '' && required[fieldName])
    setValidityError(fieldName, 0, isError)
    return !isError
  }
  const minLengthCheck = (fieldName, value) => { // would only work 
    if (!withMinLength[fieldName]) return true
    let isError = value.length >= withMinLength[fieldName]
    setValidityError(fieldName, '1-p', isError, withMinLength[fieldName])
    return !isError
  }
  const handleChange = (e) => {    
    let target = e.currentTarget   
    console.log(target) 
    if (target.type === 'radio' || target.type === 'checkbox') {
      console.log('radio')
      requiredFieldCheck(target.name, target.value)
      setValues(prev => ({
        ...prev,
        [target.name]: target.value
      }))
    } else {
      console.log('not radio')
      if (matchesRegex(target.name, target.value)) {
        requiredFieldCheck(target.name, target.value)
        minLengthCheck(target.name, target.value)
        setValues(prev => ({
          ...prev,
          [target.name]: target.value
        }))
      }
    }          
  }

  const validateFields = () => {
    let noReqFieldsEmpty = fields.filter(field => required[field.name]).reduce((allFields, field) => (
      requiredFieldCheck(field.name, values[field.name]) && allFields
    ), true)
    let noErrors = Object.values(validityErrors).reduce((allFields, field) => (
      Object.values(field).reduce((allErrors, err) => (
        !err[0] && allErrors
      ), true) && allFields
    ), true)
    return noReqFieldsEmpty && noErrors
  }
  const handleSubmit = (e) => {
    let CSRFheader = cookies.csrftoken ? { 'X-CSRFToken': cookies.csrftoken } : {}
    validateFields() && fetch(submitUrl,
      {
        method: 'POST',
        body: JSON.stringify({...values, ...dataToSend}),
        headers: {
          'Content-Type': 'application/json',
          ...CSRFheader,
          ...headers
        }
      }
    )
    .then(res => res.json())
    .then(res => {
      onResponse({...values, ...dataToSend}, res)
      console.log(res)
    })

    e.preventDefault()
  }
  
  let allErrorMessages = []
  let inputs = fields.map((field, index) => {
    let errors = validityErrors[field.name] || {}
    let errorMessages = singleErrorList ?
      Object.keys(errors).filter(errID => errors[errID][0]).map(errID => {         
        let err = errID.includes('-p') ?
          VALIDATION_ERRORS_ALL[errID](errors[errID][1]) : VALIDATION_ERRORS_ALL[errID]
        return err
      })
    :
      Object.keys(errors).filter(errID => errors[errID][0]).map(errID => {         
        let err = errID.includes('-p') ?
          VALIDATION_ERRORS[errID](errors[errID][1]) : VALIDATION_ERRORS[errID]
        return err
    })

    errorMessages.forEach(msg => {
      !allErrorMessages.includes(msg) && allErrorMessages.push(msg)
    })
    if (field.type === 'radio')
      return <RadioGroup {...field} key={index} onChange={handleChange} value={values[field.name]} 
        validityErrors={errorMessages || []} displayErrors={!singleErrorList} />
    else if (field.type === 'select')
      return <Select {...field} key={index} onChange={handleChange} value={values[field.name]} 
        validityErrors={errorMessages || []} displayErrors={!singleErrorList} />
    else if (field.type === 'slider')
      return <Slider {...field} key={index} onChange={handleChange} value={values[field.name]} 
          validityErrors={errorMessages || []} displayErrors={!singleErrorList} />
    else if (field.type === 'checkbox')
      return <CheckboxGroup {...field} key={index} onChange={handleChange} value={values[field.name]} 
        validityErrors={errorMessages || []} displayErrors={!singleErrorList} />
    else
      return <Input {...field} onChange={handleChange} value={values[field.name]} 
        validityErrors={errorMessages || []} key={index} displayErrors={!singleErrorList} />
  })

  let gridCols = { 'gridTemplateColumns': '1fr '.repeat(columns) }
  
  let formValidityErrors = (singleErrorList && allErrorMessages.length !== 0) &&
    <ul className="form_validity-errors">      
      {allErrorMessages.map((err, index) => <li className="form_validity-error" key={index}>{err}</li>)}
    </ul> 
    

  return (    
    <form className='form' style={{width}} onSubmit={handleSubmit} noValidate autoComplete='off' >      
      <div className='form_body'>
        <div className='form_title'><h2>{formTitle}</h2></div>
        <div className='form_fields' style={gridCols}>
          {inputs}
        </div>
        {formValidityErrors}       
      </div>
      <Button type='form' submit  />
      
    </form>
  )
}
Form.defaultProps = {
  fields: [],
  columns: 1,
  singleErrorList: true,
  formTitle: 'Form',
  dataToSend: {},
  headers: {}
}
  
export default Form
