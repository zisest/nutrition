import React, { useState, useEffect } from 'react'
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

const FETCH_PLAN_URL ='/api/get_meal_plan/'
const AUTHORIZATION_HEADER = (token) => ({'Authorization': 'Bearer ' + token})


function MealPlanPage({ auth, onAuth }) {
  const [plan, setPlan] = useState(null)
  const [planSize, setPlanSize] = useState(null)
  const [parsedPlan, setParsedPlan] = useState([])
  const [totalNutrients, setTotalNutrients] = useState([])


  const parsePlan = (rawPln, planSz) => {
    const NAN_FIELDS = ['name', 'categories', 'source_categories']

    let rawPlan = [...rawPln]
    
    //let meals = PLAN_SIZES[planSz]
    let parsed = []
    let nutrients = {}

    rawPlan.forEach((rawPortions, mealNo) => { //meals = [4,4,4]
      //let rawPortions = rawPlan[mealNo] //.splice(0, mealSz)
      // console.log(mealSz)
      let totalMainNutrients = []
      let parsedMeal = rawPortions.map(portion => {
        // console.log(portion)
        for (let [name, value] of Object.entries(portion)) {
          if (!NAN_FIELDS.includes(name) && value) {
            if (!(name in nutrients)) {
              nutrients[name] = value
            } else {
              nutrients[name] += value
            }
          }
        }
        let mainNutrients = [portion.portion, portion.protein, portion.fat, portion.carbohydrate, portion.energy]
        if (!totalMainNutrients.length) {
          totalMainNutrients = mainNutrients
        } else {
          totalMainNutrients = totalMainNutrients.map((v, i) => v + mainNutrients[i])
        }
        return [portion.name, ...mainNutrients]
      })
      parsedMeal.push(['Итого', ...totalMainNutrients])
      parsed.push(parsedMeal)
    })
    nutrients = Object.keys(NUTRIENTS).map(nutrient => (
      { ...NUTRIENTS[nutrient], value: nutrients[nutrient] }
    ))
    return { parsed, nutrients }
  }

  const fetchPlan = () => {
    fetch(FETCH_PLAN_URL, { headers: AUTHORIZATION_HEADER(localStorage.getItem('access_token')) })
    .then(res => {
      if (!res.ok) throw {status: res.status, data: 'Failed to fetch'}
      return res.json()
    })
    .then(res => {     
      setPlan(res.plan)
      setPlanSize(res.size)
      let { parsed, nutrients } = parsePlan(res.plan, res.size)
      setParsedPlan(parsed)
      setTotalNutrients(nutrients)
    })
    .catch(err => {
      console.log('SOME ERROR')
      if (err.status === 401) return retryRequest(null, FETCH_PLAN_URL, 'GET')
        .then(res => {
          setPlan(res.data.plan)
          setPlanSize(res.data.size)
          let { parsed, nutrients } = parsePlan(res.data.plan, res.data.size)
          setParsedPlan(parsed)
          setTotalNutrients(nutrients)
          console.log('retryRequest successful', res.status, res.data)
        })
        .catch(err => {
          if (err.logout) onAuth(false)
          console.error('retryRequest error!', err.status, err.data, err)
        })
    })
  }

  useEffect(() => { //fetching forms
    fetchPlan()
  }, [auth])


  const saveAsPng = () => {
    if (parsedPlan.length) {
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
    <div className='meal-plan-page'>
      <div className="meal-plan-page_navbar">
        <Navbar title='Nutritional value' size='350px'>
          <DataTable fields={totalNutrients} />
        </Navbar>
      </div>
      <div className="meal-plan-page_main-area">
        <div className="meal-plan-page_container">
          <Window width='700px' blank className='meal-plan_header-window'>
            <div className="meal-plan_header">
              <div className="meal-plan_title"><h2>Meal plan</h2></div>
              <div className="meal-plan_refresh">
                <Button type='corner' corner='top-right' text='↺' style={{ fontSize: '31px' }} />
              </div>              
              <div className='meal-plan_header-body'>
                Нажмите <span onClick={saveAsPng} className='meal-plan_download'>сюда</span>, чтобы скачать план питания
              </div>
            </div>            
          </Window>
          <Window width='700px' >
          <MealPlan plan={parsedPlan} />
            
          </Window>
        </div>
        
      </div>
    </div>
  )
}
MealPlanPage.defaultProps = { }
  
export default MealPlanPage
