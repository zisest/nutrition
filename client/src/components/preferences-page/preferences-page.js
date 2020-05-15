import React, { useState, useEffect, Fragment } from 'react'
import './preferences-page.css'
import Window from '../window'
import DataTable from '../data-table'
import DataSquare from '../data-square'
import Button from '../button'
import Form from '../form'
import { refreshToken, retryRequest } from '../../api/auth'

const POST_PARAMETERS_URL = '/api/save_user_params/'
const POST_PREFERENCES_URL = '/api/user_preferences/'

const FETCH_FORMS_URL = '/api/get_preferences_page/'
const AUTHORIZATION_HEADER = (token) => ({'Authorization': 'Bearer ' + token})
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

  const fetchForms = () => {
    fetch(FETCH_FORMS_URL, { headers: AUTHORIZATION_HEADER(localStorage.getItem('access_token')) })
    .then(res => {
      if (!res.ok) throw {status: res.status, data: 'Failed to fetch'}
      return res.json()
    })
    .then(res => {     
      setForms(res)
    })
    .catch(err => {
      if (err.status === 401) return retryRequest(null, FETCH_FORMS_URL, 'GET')
        .then(res => {
          setForms(res.data)
          console.log('retryRequest successful', res.status, res.data)
        })
        .catch(err => {
          if (err.logout) onAuth(false)
          console.error('retryRequest error!', err.status, err.data, err)
        })
    })
  }

  useEffect(() => { //fetching forms
    fetchForms()
  }, [auth])

  const handleResponse = (req, res, status, url) => { // handle resonse from protected view    
    if (status === 401) retryRequest(req, url)
      .then(res => {
        console.log('retryRequest successful', res.status, res.data)
      })
      .catch(err => {
        if (err.logout) onAuth(false)
        console.error('retryRequest error!', err.status, err.data, err)
      })
    else console.log('Response!: ', req, res, status)
  }
  
  let physParamsPALGoalSections = [
    { title: 'Physiological parameters', size: 4, columns: 4 }, 
    { title: 'Physical activity & goals', size: 2, columns: 2 }, 
  ]
  let physParamsPALGoalForm = forms && forms['phys-params-PAL-goal'] ? <Form
    singleErrorList={true}
    //dataToSend={dataToSend}
    submitUrl={POST_PARAMETERS_URL} 
    fields={forms['phys-params-PAL-goal']} 
    sections={physParamsPALGoalSections}
    onResponse={handleResponse}
    withAuth
  /> : ''

  
  let foodPrefsForm = forms && forms['food-preferences'] ? <Form
    columns={2} 
    singleErrorList={true}
    fields={forms['food-preferences']} 
    submitUrl={POST_PREFERENCES_URL} 
    formTitle={'Food preferences'}
    onResponse={handleResponse}
    withAuth
  /> : ''

  return (
    <Fragment>
    <div className='preferences-page'>
      <div className="preferences-page_main-area">
        <div className="preferences-page_grid">
        <Window blank width='600px' className='preferences-page_phys-params' style={{ zIndex: 1 }}>
          {physParamsPALGoalForm}
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
