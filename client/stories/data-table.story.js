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
    { name: 'Proteins', value: 55, unit: { name: 'g', accuracy: 2 } },
    { name: 'Fats', value: 16, unit:  { name: 'g', accuracy: 2 } },
    { name: 'Carbohydrates', value: 89, unit:  { name: 'g', accuracy: 2 } }
  ],
  leader: 'centeredDots'
}

let props2 = {
  fields: [
    { label: 'Proteins', value: 55, unit:  { name: 'g', accuracy: 2 } },
    { label: 'Fats', value: 16, unit:  { name: 'g', accuracy: 2 } },
    { label: 'Carbohydrates', value: 89, unit:  { name: 'g', accuracy: 2 } }
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