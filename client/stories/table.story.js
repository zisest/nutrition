import React from 'react'
import Table from '../src/components/table'

export default { 
  title: 'Table',
  component: Table
}

export const TableStory = () => 
<div style={{width: '500px', background: 'black', padding: '20px'}}>
  <Table 
    header={['Column 1', 'Column 2', 'Column 3']}
    content={[[1, 2, 3], [4, 5, 6], [7, 8, 9]]}
    cols={[50,25,25]}
  />
</div>