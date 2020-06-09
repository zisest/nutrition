import React, { useState, useEffect, Fragment } from 'react'
import { Redirect } from 'react-router-dom'
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

const dummyNutrients = [
    { label: 'Пищ. волокна', value: 30, unit:  { name: 'г', accuracy: 0.01 } },
    { label: 'НЖК', value: 25, unit:  { name: 'г', accuracy: 0.01 }, sign: '<' },
    { label: 'ПНЖК', value: 11, unit:  { name: 'г', accuracy: 0.01 }, sign: '>' },
    { label: 'Холестерин', value: 300, unit:  { name: 'мг', accuracy: 0.01 }, sign: '<' },
    { label: 'Натрий', value: 2400, unit:  { name: 'мг', accuracy: 0.01 }, sign: '<' },
    { label: 'Калий', value: 3500, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Кальций', value: 1000, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Фосфор', value: 1000, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Йод', value: 150, unit:  { name: 'μг', accuracy: 0.01 } },
    { label: 'Магний', value: 400, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Железо', value: 14, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Цинк', value: 9.5, unit:  { name: 'мг', accuracy: 0.01 } },
]

const dummyNutrients2 = [
    { label: 'Витамин A', value: 1, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Витамин B1', value: 1.5, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Витамин B2', value: 1.8, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Витамин B3', value: 20, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Витамин B6', value: 1.3, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Витамин B9', value: 400, unit:  { name: 'μг', accuracy: 0.01 } },
    { label: 'Витамин B12', value: 2.4, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Витамин C', value: 70, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Витамин D', value: 15, unit:  { name: 'μг', accuracy: 0.01 } },
    { label: 'Витамин E', value: 10, unit:  { name: 'мг', accuracy: 0.01 } },
    { label: 'Витамин K', value: 120, unit:  { name: 'μг', accuracy: 0.01 } },

]

function PreferencesPage({ auth, onAuth, onPlanRequest }) {
  const [forms, setForms] = useState(null)
  const [state, setState] = useState([])
  const [toMealPlan, setToMealPlan] = useState(false)

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
    { title: 'Физиологические параметры', size: 4, columns: 4 },
    { title: 'Физическая активность & цель', size: 2, columns: 2 },
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
    formTitle={'Предпочтения'}
    onResponse={handleResponse}
    withAuth
  /> : ''

  let energySquares = forms && forms['energy'] ? forms['energy'].map((square, index) => <DataSquare key={index} {...square} />) : ''
  let macronutrientsTable = forms && forms['nutrients'] ? <DataTable fields={forms['nutrients']} /> : ''

  if (toMealPlan) {
    onPlanRequest(true)
    return <Redirect to='/meal-plan' />
  }

  return (
    <Fragment>
    <div className='preferences-page' style={!auth ? { filter: 'blur(10px)' } : {}}>
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
          empty={!state.includes('energy')} 
          emptyText='Здесь ничего нет.\Пожалуйста, укажите параметры.'
        >
          <div className="nutrients_grid">
            <div className="nutrients_title"><h2>Потребности и рекомендации</h2></div>
            <div className="nutrients_energy">
              {energySquares}
            </div>
            <div className="nutrients_main-nutrients">
              {macronutrientsTable}
            </div>
            <div className="nutrients_other-title">
              <h3>Питательные вещества</h3>
            </div>
            <div className="nutrients_other-nutrients-1">
              <DataTable fields={dummyNutrients} />
            </div>
            <div className="nutrients_other-nutrients-2">
              <DataTable fields={dummyNutrients2} />
            </div>
            <div className="nutrients_button">
              <Button type='corner' corner='bottom-right' text='Рассчитать рацион' onClick={() => setToMealPlan(true)} />
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
