import React, { useState, useEffect } from 'react'
import Input, { RadioGroup, Select, Slider, CheckboxGroup } from '../input'
import Button from '../button'
import FormButton from '../form-button'
import './form.css'
  
const VALIDATION_ERRORS = {
  0: 'Required fields should not be empty'
}

//change to useEffect 
function Form({ fields, formTitle, submitText, submitUrl, columns, singleErrorList, dataToSend, width, onResponse }) {
  const [values, setValues] = useState({})
  const [validityErrors, setValidityErrors] = useState({})
  let regexs = fields.reduce((ac, field) => ({...ac, [field.name]: RegExp(field.regex) || /[\s\S]*/}), {})
  let required = fields.reduce((ac, field) => ({...ac, [field.name]: !!field.required}), {})

  useEffect(() => {
    let initValues = fields.reduce((ac, field) => ({...ac, [field.name]: field.initialValue || ''}), {})
    let initValidityErrors = fields.reduce((ac, field) => ({...ac, [field.name]: {}}), {})
    setValues(initValues)
    setValidityErrors(initValidityErrors)
  }, [fields])

  const setValidityError = (fieldName, errID, errState) => {
    setValidityErrors(prev => 
      ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        [errID]: errState
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
        !err && allErrors
      ), true) && allFields
    ), true)
    return noReqFieldsEmpty && noErrors
  }
  const handleSubmit = (e) => {
    validateFields() && fetch(submitUrl, 
      {
        method: 'POST',
        body: JSON.stringify({...values, ...dataToSend}),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    .then(res => res.text())
    .then(res => {
      onResponse({...values, ...dataToSend}, res)
      console.log(res)
    })

    e.preventDefault()
  }
  
  let allErrorMessages = []
  let inputs = fields.map((field, index) => {
    let errors = validityErrors[field.name] || {}
    let errorMessages = Object.keys(errors).filter(errID => errors[errID]).map(errID => VALIDATION_ERRORS[errID])
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
      <FormButton submit  />
      
    </form>
  )
}
Form.defaultProps = {
  fields: [],
  columns: 1,
  singleErrorList: true,
  formTitle: 'Form',
  dataToSend: {}
}
  
export default Form
