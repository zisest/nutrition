import React from 'react'
import './table.css'

// content: [[1,2,3],[4,5,6]]
// header: [a,b,c]
// cols: [20, 40, 40] - width of cols
// boldRows [0, 4]
function Table({ content, cols, header, boldRows, centeredCols }) {
  let tableHeader = header ? 
    <thead className='table_thead' ><tr>
      {header.map(label => <th>{label}</th>)}
    </tr></thead>
    : ''

  let tableBody = <tbody className='table_tbody' >
    {content.map((row, i) => (
      <tr>
        {row.map((el, idx) => {
          let colWidth = cols && cols[idx] ? { minWidth: cols[idx] + 'px' } : {} 
          let colAlign = centeredCols.includes(idx) ? { textAlign: 'center' } : {}
          return <td style={{ ...colWidth, ...colAlign }} 
            className={boldRows.includes(i) ? 'table_td__bold': ''}>
            {el}
          </td>
        })}
      </tr>
    ))}
  </tbody>

  return (
    <div className="table">
    <table className='table-tag'>
      {tableHeader}
      {tableBody}
    </table>
    </div>
    
  )
}
Table.defaultProps = {
  content: [],
  boldRows: [],
  centeredCols: []
 }
  
export default Table
