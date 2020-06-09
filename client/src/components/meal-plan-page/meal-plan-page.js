import React, { useState, useEffect, useParams } from 'react'
import domtoimage from 'dom-to-image'
import './meal-plan-page.css'
import Navbar from '../navbar'
import Window from '../window'
import Button from '../button'
import Table from '../table'
import MealPlan from '../meal-plan'
import { refreshToken, retryRequest } from '../../api/auth'
import DataTable from '../data-table'

// const PLAN_SIZES = {
//   3: [4, 4, 4]
// }

const NUTRIENTS = {       
  "portion": {
    label: "Масса",
    unit: {
      accuracy: 0.01,
      name: 'г'
    }
  },
  "protein": {
    label: "Белки",
    unit: {
      accuracy: 0.01,
      name: 'г'
    }
  },
  "fat": {
    label: "Жиры",
    unit: {
      accuracy: 0.01,
      name: 'г'
    }
  },
  "carbohydrate": {
    label: "Углеводы",
    unit: {
      accuracy: 0.01,
      name: 'г'
    }
  }, 
  "energy": {
    label: "Энергетическая ценность",
    unit: {
      accuracy: 0.01,
      name: 'ккал'
    }
  },
  "water": {
    label: "Вода",
    unit: {
      accuracy: 0.01,
      name: 'мл'
    }
  },
  "sfa": {
    label: "Насыщенные жирные кислоты",
    unit: {
      accuracy: 0.01,
      name: 'г'
    }
  },
  "mds": {
    label: "Моно- и дисахариды",
    unit: {
      accuracy: 0.01,
      name: 'г'
    }
  },
  "starch": {
    label: "Крахмал",
    unit: {
      accuracy: 0.01,
      name: 'г'
    }
  },
  "fiber": {
    label: "Пищевые волокна",
    unit: {
      accuracy: 0.01,
      name: 'г'
    }
  },
  "sodium": {
    label: "Натрий",
    unit: {
      accuracy: 0.01,
      name: 'мг'
    }
  },
  "potassium": {
    label: "Калий",
    unit: {
      accuracy: 0.01,
      name: 'мг'
    }
  },
  "calcium": {
    label: "Кальций",
    unit: {
      accuracy: 0.01,
      name: 'мг'
    }
  },
  "magnesium": {
    label: "Магний",
    unit: {
      accuracy: 0.01,
      name: 'мг'
    }
  },
  "phosphorus": {
    label: "Фосфор",
    unit: {
      accuracy: 0.01,
      name: 'мг'
    }
  },
  "iron": {
    label: "Железо",
    unit: {
      accuracy: 0.01,
      name: 'мг'
    }
  },
  "thiamine": {
    label: "Витамин B1",
    unit: {
      accuracy: 0.01,
      name: 'мг'
    }
  },
  "riboflavin": {
    label: "Витамин B2",
    unit: {
      accuracy: 0.01,
      name: 'мг'
    }
  },
  "niacin": {
    label: "Витамин PP",
    unit: {
      accuracy: 0.01,
      name: 'мг'
    }
  },
  "beta_carotene": {
    label: "Бета-каротин",
    unit: {
      accuracy: 0.01,
      name: 'µг'
    }
  },
  "vitamin_c": {
    label: "Витамин C",
    unit: {
      accuracy: 0.01,
      name: 'мг'
    }
  },
  "cholesterol": {
    label: "Холестерин",
    unit: {
      accuracy: 0.01,
      name: 'мг'
    }
  },
  "retinol": {
    label: "Витамин A",
    unit: {
      accuracy: 0.01,
      name: 'µг'
    }
  }
}

const FETCH_PLANS_URL ='/api/get_meal_plans/'
const GENERATE_PLAN_URL = '/api/generate_meal_plan/'
const AUTHORIZATION_HEADER = (token) => ({'Authorization': 'Bearer ' + token})


function MealPlanPage({ auth, onAuth, onPlanRequest, awaitingNewPlan }) {
  const [plans, setPlans] = useState([])
  // const [planSizes, setPlanSizes] = useState(null)
  const [parsedPlans, setParsedPlans] = useState([])
  const [totalNutrients, setTotalNutrients] = useState([])
  const [currentPlan, setCurrentPlan] = useState(0)


  const parsePlan = (rawPln) => {
    const NAN_FIELDS = ['name', 'categories', 'source_categories']
    let rawPlan = {...rawPln}
    let portions = rawPlan.portions
    let planSize = rawPlan.size
    
    let parsed = Array(planSize).fill([])    
    let totalMainNutrients = Array(planSize).fill([])
    let allNutrients = {}

    portions.forEach(rawPortion => {
      let mealNo = rawPortion['meal_no'] - 1
      let portion = rawPortion['food']

      // for allNutrients
      for (let [name, value] of Object.entries(portion)) {
        if (!NAN_FIELDS.includes(name) && value) {
          if (!(name in allNutrients)) {
            allNutrients[name] = value
          } else {
            allNutrients[name] += value
          }
        }
      }

      let mainNutrients = [portion.portion, portion.protein, portion.fat, portion.carbohydrate, portion.energy]
      
      if (!totalMainNutrients[mealNo].length) {
        totalMainNutrients[mealNo] = mainNutrients
      } else {
        totalMainNutrients[mealNo] = totalMainNutrients[mealNo].map((v, i) => v + mainNutrients[i])
      }

      parsed[mealNo] = [...parsed[mealNo], [portion.name, ...mainNutrients]]
    })

    // inserting nutrients values into template
    allNutrients = Object.keys(NUTRIENTS).map(nutrient => (
      { ...NUTRIENTS[nutrient], value: allNutrients[nutrient] }
    ))

    parsed = parsed.map((meal, i) => [ ...meal, ['Итого', ...totalMainNutrients[i]] ])
    
    return [ parsed, allNutrients ]
   
  }


  const fetchPlans = () => {
    console.log('fetching plans')
    fetch(FETCH_PLANS_URL, { headers: AUTHORIZATION_HEADER(localStorage.getItem('access_token')) })
    .then(res => {
      if (!res.ok) throw {status: res.status, data: 'Failed to fetch'}
      return res.json()
    })
    .then(res => {     
      setPlans(res)      
      let parsed = []
      let nutrients = []
      res.forEach(plan => {
        let [ planParsed, planNutrients ] = parsePlan(plan)
        parsed.push(planParsed)
        nutrients.push(planNutrients)
      })      
      setParsedPlans(parsed)
      setTotalNutrients(nutrients)
    })
    .catch(err => {
      console.log('SOME ERROR')
      console.log(err)
      if (err.status === 401) return retryRequest(null, FETCH_PLANS_URL, 'GET')
        .then(res => {
          setPlans(res)      
          let parsed = []
          let nutrients = []
          res.forEach(plan => {
            let [ planParsed, planNutrients ] = parsePlan(plan)
            parsed.push(planParsed)
            nutrients.push(planNutrients)
          })      
          setParsedPlans(parsed)
          setTotalNutrients(nutrients)
          console.log('retryRequest successful', res.status, res.data)
        })
        .catch(err => {
          if (err.logout) onAuth(false)
          console.error('retryRequest error!', err.status, err.data, err)
        })
    })
  }

  const generateNewPlan = () => {
    console.log('generating new plan')
    fetch(GENERATE_PLAN_URL, { headers: AUTHORIZATION_HEADER(localStorage.getItem('access_token')) })
    .then(res => {
      if (!res.ok) throw {status: res.status, data: 'Failed to fetch'}
      return res.json()
    })
    .then(res => {     
      setPlans(prev => ([...prev, res]))          
      let [ planParsed, planNutrients ] = parsePlan(res)                 
      setParsedPlans(prev => ([...prev, planParsed]))
      setTotalNutrients(prev => ([...prev, planNutrients]))
    })
    .catch(err => {      
      if (err.status === 401) return retryRequest(null, GENERATE_PLAN_URL, 'GET')
        .then(res => {
          setPlans(prev => ([...prev, res.data]))          
          let [ planParsed, planNutrients ] = parsePlan(res.data)                 
          setParsedPlans(prev => ([...prev, planParsed]))
          setTotalNutrients(prev => ([...prev, planNutrients]))
          console.log('retryRequest successful', res.status, res.data)
        })
        .catch(err => {
          if (err.logout) onAuth(false)
          console.error('retryRequest error!', err.status, err.data, err)
        })
      else console.error(err)
    })
  }

  const changeSelectedPlan = (dir) => {
    let numberOfPlans = parsedPlans.length
    let current = currentPlan
    if (dir === 'next') {
      if (current < numberOfPlans - 1)
        setCurrentPlan(prev => prev + 1)
      else
        setCurrentPlan(0)
    } else {
      if (current === 0)
        setCurrentPlan(numberOfPlans - 1)
      else
        setCurrentPlan(prev => prev - 1)
    }
  }

  useEffect(() => { //fetching plans on auth
    fetchPlans()
  }, [auth])

  useEffect(() => {
    setCurrentPlan(parsedPlans.length - 1)
    console.log('Change current plan')
  }, [parsedPlans])

  useEffect(() => {
    if (awaitingNewPlan) {
      onPlanRequest(false)
      generateNewPlan()
    }
    
  }, [awaitingNewPlan])


  const saveAsPng = () => {
    if (parsedPlans.length && parsedPlans[currentPlan].length) {
      domtoimage.toPng(document.querySelector('.meal-plan'), { bgcolor: '#f5f6f6' })
      .then(function (dataUrl) {
          let link = document.createElement('a')
          link.download = 'meal-plan.png'
          link.href = dataUrl
          link.click()
      })
    }
  }

  return (
    <div className='meal-plan-page' style={!auth ? { filter: 'blur(10px)' } : {}}>
      <div className="meal-plan-page_navbar">
        <Navbar title='Пищевая ценность' size='350px' fontSize='24px' >
          <DataTable fields={totalNutrients[currentPlan]} />
        </Navbar>
      </div>
      <div className="meal-plan-page_main-area">
        <div className="meal-plan-page_container">
          <Window width='700px' blank className='meal-plan_header-window'>
            <div className="meal-plan_header">
              <div className="meal-plan_title"><h2>План питания</h2></div>
              <div className="meal-plan_refresh">
                <Button type='corner' corner='top-right' text='↺' style={{ fontSize: '31px' }} onClick={generateNewPlan} />
              </div>              
              <div className='meal-plan_header-body'>
                Нажмите <span onClick={saveAsPng} className='meal-plan_download'>сюда</span>, чтобы скачать план питания
              </div>
            </div>            
          </Window>
          <Window width='700px' empty={!parsedPlans.length} emptyText='Здесь ничего нет.\Пожалуйста, укажите параметры.' >
          <div className="meal-plan_select-buttons">
            <div className="meal-plan_prev-button" onClick={() => changeSelectedPlan('prev')} >←</div>
            <div className="meal-plan_next-button" onClick={() => changeSelectedPlan('next')} >→</div>
          </div> 
          <MealPlan plan={parsedPlans[currentPlan]} />                  
          </Window>
        </div>
        
      </div>
    </div>
  )
}
MealPlanPage.defaultProps = { }
  
export default MealPlanPage
