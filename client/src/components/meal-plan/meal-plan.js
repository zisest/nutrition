import React from 'react'
import './meal-plan.css'
import Table from '../table'
import DataTable from '../data-table'

const MEAL_NAMES = {
  2: ['Завтрак', 'Ужин'],
  3: ['Завтрак', 'Обед', 'Ужин'],
  4: ['Завтрак', 'Перекус', 'Обед', 'Ужин'],
  5: ['Завтрак', 'Перекус', 'Обед', 'Перекус', 'Ужин'],
  6: ['Завтрак', 'Перекус', 'Обед', 'Перекус', 'Ужин', 'Перекус'],
  7: ['Завтрак', 'Второй завтрак', 'Перекус', 'Обед', 'Перекус', 'Ужин', 'Перекус'],
}
const COLUMN_NAMES = ['Продукт', 'Порция', 'Б', 'Ж', 'У', 'Энергия']




function MealPlan({ plan }) {
  let mealNames = MEAL_NAMES[plan.length]

  
  let mealPlan = plan.map((meal, mealNo) => {    
    return <>
      <h2>{mealNames && mealNames[mealNo]}</h2>
      <div className="meal-plan_meal-table">
      <Table 
        content={meal} 
        header={!mealNo ? COLUMN_NAMES : null} 
        boldRows={[meal.length - 1]} 
        centeredCols={[1, 2, 3, 4, 5]} 
        cols={['!230', 65, 40, 40, 40, 70]}
      />
      </div>      
    </>
  })

  return (
    <div className='meal-plan'>
      {mealPlan}
    </div>
  )
}
MealPlan.defaultProps = {
  plan: [[], [], []]
}
  
export default MealPlan
