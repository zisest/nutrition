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
  { label: 'Proteins', value: 55, unit:  { name: 'g', accuracy: 2 } },
  { label: 'Fats', value: 16, unit:  { name: 'g', accuracy: 2 } },
  { label: 'Carbohydrates', value: 89, unit:  { name: 'g', accuracy: 2 } }  
]
const BMR = { label: 'estimated BMR', value: 7, unit: { name: 'MJ/day', accuracy: 3 }, alternativeUnits: [{ name: 'kcal/day', rate: 238.8458966, accuracy: 0.01 }] }
const TEE = { label: 'estimated TEE', value: 7.2, unit: { name: 'MJ/day', accuracy: 3 }, alternativeUnits: [{ name: 'kcal/day', rate: 238.8458966, accuracy: 0.01 }] }
const req = { label: 'estimated energy requirements', value: 7.415, unit: { name: 'MJ/day', accuracy: 3 }, alternativeUnits: [{ name: 'kcal/day', rate: 238.8458966, accuracy: 0.01 }] }

const dummyNutrients = [
    { label: 'Fiber', value: 30, unit:  { name: 'g', accuracy: 0.01 } },
    { label: 'Saturated fat', value: 25, unit:  { name: 'g', accuracy: 0.01 }, sign: '<' },
    { label: 'PUFAs', value: 11, unit:  { name: 'g', accuracy: 0.01 }, sign: '>' },
    { label: 'Cholesterol', value: 300, unit:  { name: 'mg', accuracy: 0.01 }, sign: '<' },
    { label: 'Sodium', value: 2400, unit:  { name: 'mg', accuracy: 0.01 }, sign: '<' },
    { label: 'Potassium', value: 3500, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Calcium', value: 1000, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Phosphorus', value: 1000, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Iodine', value: 150, unit:  { name: 'μg', accuracy: 0.01 } },
    { label: 'Magnesium', value: 400, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Iron', value: 14, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Zinc', value: 9.5, unit:  { name: 'mg', accuracy: 0.01 } },
]

const dummyNutrients2 = [
    { label: 'Vitamin A', value: 1, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Vitamin B1', value: 1.5, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Vitamin B2', value: 1.8, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Vitamin B3', value: 20, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Vitamin B6', value: 1.3, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Vitamin B9', value: 400, unit:  { name: 'μg', accuracy: 0.01 } },
    { label: 'Vitamin B12', value: 2.4, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Vitamin C', value: 70, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Vitamin D', value: 15, unit:  { name: 'μg', accuracy: 0.01 } },
    { label: 'Vitamin E', value: 10, unit:  { name: 'mg', accuracy: 0.01 } },
    { label: 'Vitamin K', value: 120, unit:  { name: 'μg', accuracy: 0.01 } },

]

function PreferencesPage({ auth, onAuth }) {
  const [forms, setForms] = useState(null)
  const [state, setState] = useState([])
  

  const fetchForms = () => {
    fetch(FETCH_FORMS_URL, { headers: AUTHORIZATION_HEADER(localStorage.getItem('access_token')) })
    .then(res => {
      if (!res.ok) throw {status: res.status, data: 'Failed to fetch'}
      return res.json()
    })
    .then(res => {     
      setForms(res.data)
      setState(res.status)
    })
    .catch(err => {
      if (err.status === 401) return retryRequest(null, FETCH_FORMS_URL, 'GET')
        .then(res => {
          setForms(res.data.data)
          setState(res.data.status)
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

  const setNewRequirements = (requirements) => {
    let energy = forms['energy'].map(field => ({ ...field, value: requirements[field.name] }))
    let nutrients = forms['nutrients'].map(field => ({ ...field, value: requirements[field.name] }))
    setForms(prev => ({...prev, energy, nutrients}))
    !state.includes('energy') && setState(prev => ([...prev, 'energy', 'nutrients']))    
  }

  const handleResponse = (req, res, status, url) => { // handle resonse from protected view    
    if (status === 401) retryRequest(req, url)
      .then(res => {
        console.log('retryRequest successful', res.status, res.data)
        if (res.data.data && res.data.data.requirements)
          setNewRequirements(res.data.data.requirements)   
      })
      .catch(err => {
        if (err.logout) onAuth(false)
        console.error('retryRequest error!', err.status, err.data, err)
      })
    else {
      console.log('Response!: ', req, res, status)
      if (res.data && res.data.requirements)
        setNewRequirements(res.data.requirements)      
    }
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

  let energySquares = forms && forms['energy'] ? forms['energy'].map((square, index) => <DataSquare key={index} {...square} />) : ''
  let macronutrientsTable = forms && forms['nutrients'] ? <DataTable fields={forms['nutrients']} /> : ''


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
        <Window 
          blank width='610px'            
          className='nutrients' 
          title='Nutrition requirements' 
          empty={!state.includes('energy')} 
          emptyText='There is nothing here.\Please provide your parameters.' 
        >
          <div className="nutrients_grid">
            <div className="nutrients_title"><h2>Nutrition requirements</h2></div>
            <div className="nutrients_energy">
              {energySquares}
            </div>
            <div className="nutrients_main-nutrients">
              {macronutrientsTable}
            </div>
            <div className="nutrients_other-title">
              <h3>Other nutrients</h3>
            </div>
            <div className="nutrients_other-nutrients-1">
              <DataTable fields={dummyNutrients} />
            </div>
            <div className="nutrients_other-nutrients-2">
              <DataTable fields={dummyNutrients2} />
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
