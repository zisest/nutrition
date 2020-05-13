import React, { useState, useEffect, Fragment } from 'react'
import './preferences-page.css'
import Window from '../window'
import DataTable from '../data-table'
import DataSquare from '../data-square'
import Button from '../button'
import Form from '../form'
import AuthModal from '../auth-modal'

const FETCH_URL = '/api/get_forms/?forms=food-preferences,physiological-parameters,PAL-and-goals'
const MODEL_NAME = 'MyModel1'
const dataToSend = { MODEL_NAME }

const mainNutrients = [
  { name: 'Proteins', value: 55, unit: 'g' },
  { name: 'Fats', value: 16, unit: 'g' },
  { name: 'Carbohydrates', value: 89, unit: 'g' }  
]
const BMR = { title: 'estimated BMR', values: ['7 MJ/day', '1850 kcal/day'] }
const TEE = { title: 'estimated TEE', values: ['7.6 MJ/day', '2120 kcal/day'] }
const req = { title: 'estimated energy requirements', values: ['7.4 MJ/day', '2034 kcal/day'] }



function PreferencesPage({ auth, onAuth }) {
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
    columns={4} 
    singleErrorList={true}
    dataToSend={dataToSend}
    submitUrl='/api/predict/' 
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
    columns={1} 
    singleErrorList={true}
    fields={forms['food-preferences']} 
    formTitle={'Food preferences'}
  /> : ''

  return (
    <Fragment>
    <div className='preferences-page'>
      <div className="preferences-page_main-area">
        <div className="preferences-page_grid">
        <Window blank width='600px' className='preferences-page_phys-params'>
          {physParamsForm}
        </Window>        
        <Window blank width='600px' className='preferences-page_phys-activity'>
          {physActivityForm}
        </Window>
        <Window blank width='600px' className='preferences-page_food-prefs'>
          {foodPrefsForm}          
        </Window>
        <Window width='600px' blank className='nutrients'>
          <div className="nutrients_grid">
            <div className="nutrients_title"><h2>Nutrition requirements</h2></div>
            <div className="nutrients_energy">
              <DataSquare {...BMR} />
              <DataSquare {...TEE} />
              <DataSquare {...req} />
            </div>
            <div className="nutrients_main-nutrients">
              <DataTable fields={mainNutrients} />
            </div>
            <div className="nutrients_other-title">
              <h3>Other nutrients</h3>
            </div>
            <div className="nutrients_other-nutrients-1">
              <DataTable fields={[...mainNutrients, ...mainNutrients, ...mainNutrients]} />
            </div>
            <div className="nutrients_other-nutrients-2">
              <DataTable fields={mainNutrients} />
            </div>
            <div className="nutrients_button">
              <Button type='corner' corner='bottom-right' text='Generate meal plan' />
            </div>
          </div>          
        </Window>
        </div>      
      </div>
    </div>
    
    </Fragment>
  )
}
PreferencesPage.defaultProps = { }
  
export default PreferencesPage
