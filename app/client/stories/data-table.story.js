import React, { Fragment } from 'react'
import DataTable from '../src/components/data-table'

export default { 
  title: 'DataTable',
  component: DataTable
}

/*
size: normal*, small, large
leader: dots*, centeredDots, none
separator: none*, line
colorScheme: main*, alternative, [nameColor, valueColor, leaderColor]
fields: [{name, value, unit}]
* - default
*/

let props1 = {
  fields: [
    { name: 'Proteins', value: 55, unit: 'g' },
    { name: 'Fats', value: 16, unit: 'g' },
    { name: 'Carbohydrates', value: 89, unit: 'g' }
  ],
  leader: 'centeredDots'
}

let props2 = {
  fields: [
    { name: 'Proteins', value: 55, unit: 'g' },
    { name: 'Fats', value: 16, unit: 'g' },
    { name: 'Carbohydrates', value: 89, unit: 'g' }
  ],
  leader: 'dots',
  size: 'large'
}

export const DataTableStory = () => 
  <Fragment>
  <div style={{width: '300px'}}>
    <DataTable {...props1}  />
  </div>
  <div style={{width: '300px', marginTop: '50px'}}>
    <DataTable {...props2}  />
  </div>
  </Fragment>