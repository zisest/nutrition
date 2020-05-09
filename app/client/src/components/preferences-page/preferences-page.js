import React, { useState, useEffect } from 'react'
import './preferences-page.css'
import Window from '../window'
import Form from '../form'

const FETCH_URL = '/api/getForms?forms=food-preferences,physiological-parameters,PAL-and-goals'
const MODEL_NAME = 'MyModel1'
const dataToSend = { MODEL_NAME }

function PreferencesPage() {
  const [forms, setForms] = useState(null)
  const [request, setRequest] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch(FETCH_URL)
    .then(res => res.json())
    .then(res => {
      setForms(res)
    })
    .catch(err => console.error('ERROR: ', err))
  }, [])

  const handleResponse = (req, res) => {
    Object.keys(dataToSend).forEach(key => {
      delete req[key]
    })
    setRequest(req)
    setResult(+res)    
  }
  
  let physParamsForm = forms && forms['physiological-parameters'] ? <Form
    columns={2} 
    singleErrorList={true}
    dataToSend={dataToSend}
    submitUrl='/api/predict' 
    fields={forms['physiological-parameters']} 
    formTitle={'Physiological parameters'}
    onResponse={handleResponse}
  /> : ''

  let physActivityForm = forms && forms['PAL-and-goals'] ? <Form
    columns={2} 
    singleErrorList={true}
    fields={forms['PAL-and-goals']} 
    formTitle={'Physical activity & goals'}
  /> : ''
  let foodPrefsForm = forms && forms['food-preferences'] ? <Form
    columns={2} 
    singleErrorList={true}
    fields={forms['food-preferences']} 
    formTitle={'Food preferences'}
  /> : ''

  return (
    <div className='preferences-page'>
      <div className="preferences-page_main-area">
        <div className="preferences-page_grid">
        <Window blank width='500px'>
          {physParamsForm}
        </Window>        
        <Window blank width='400px'>
          {foodPrefsForm}
        </Window>
        <Window blank width='500px'>
          {physActivityForm}
        </Window>
        </div>      
      </div>
    </div>
  )
}
PreferencesPage.defaultProps = { }
  
export default PreferencesPage
