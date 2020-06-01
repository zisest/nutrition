import React from 'react'
import './meal-plan-page.css'
import Navbar from '../navbar'
import Window from '../window'
import Button from '../button'
import Table from '../table'
import MealPlan from '../meal-plan'
  
let dummyPlan = [
  [
    {name: 'Apple', weight: 135, protein: 8, fat: 14, carbohydrate: 93, energy: 160},
    {name: 'Apple', weight: 135, protein: 8, fat: 14, carbohydrate: 93, energy: 160},
    {name: 'Apple', weight: 135, protein: 8, fat: 14, carbohydrate: 93, energy: 160},
    {name: 'Apple', weight: 135, protein: 8, fat: 14, carbohydrate: 93, energy: 160},
  ],
  [
    {name: 'Apple', weight: 135, protein: 8, fat: 14, carbohydrate: 93, energy: 160},
    {name: 'Apple', weight: 135, protein: 8, fat: 14, carbohydrate: 93, energy: 160},
    {name: 'Apple', weight: 135, protein: 8, fat: 14, carbohydrate: 93, energy: 160},
    {name: 'Apple', weight: 135, protein: 8, fat: 14, carbohydrate: 93, energy: 160},
  ],
  [
    {name: 'Apple', weight: 135, protein: 8, fat: 14, carbohydrate: 93, energy: 160},
    {name: 'Apple', weight: 135, protein: 8, fat: 14, carbohydrate: 93, energy: 160},
    {name: 'Apple', weight: 135, protein: 8, fat: 14, carbohydrate: 93, energy: 160},
    {name: 'Apple', weight: 135, protein: 8, fat: 14, carbohydrate: 93, energy: 160},
  ]
]

let parsedDummyPlan = [
  [
    ['Apple', 135, 8, 14, 93, 160],
    ['Apple', 135, 8, 14, 93, 160],
    ['Apple', 135, 8, 14, 93, 160],
    ['Apple', 135, 8, 14, 93, 160],
    ['Total', 540, 32, 56, 372, 640]
  ],
  [
    ['Apple', 135, 8, 14, 93, 160],
    ['Apple', 135, 8, 14, 93, 160],
    ['Apple', 135, 8, 14, 93, 160],
    ['Apple', 135, 8, 14, 93, 160],
    ['Total', 540, 32, 56, 372, 640]
  ],
  [
    ['Apple', 135, 8, 14, 93, 160],
    ['Apple', 135, 8, 14, 93, 160],
    ['Apple', 135, 8, 14, 93, 160],
    ['Apple', 135, 8, 14, 93, 160],
    ['Total', 540, 32, 56, 372, 640]
  ]
]


function MealPlanPage() {

  return (
    <div className='meal-plan-page'>
      <div className="meal-plan-page_navbar">
        <Navbar title='Nutritional value' size='350px'>
          text
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
                Нажмите <span onClick={() => alert('Downloaded')} className='meal-plan_download'>сюда</span>, чтобы скачать план питания
              </div>
            </div>            
          </Window>
          <Window width='700px' >
          <MealPlan plan={parsedDummyPlan} />
            
          </Window>
        </div>
        
      </div>
    </div>
  )
}
MealPlanPage.defaultProps = { }
  
export default MealPlanPage
