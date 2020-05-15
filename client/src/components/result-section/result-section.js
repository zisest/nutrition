import React from 'react'
import './result-section.css'
import DataSquare from '../data-square'  


function ResultSection({ input, result, model, layout }) {
  let layoutStyle = layout === 'row' ? ' result-section__row' : ''

  let sourceFields = model['SOURCE_FIELDS'].map((field, index) => {
    let fieldName = field['LABEL'] || field['NAME']
    let fieldValue = field['CATEGORIAL'] ?
      field['VALUES'].find(v => v['NAME'] === input[field['NAME']])['LABEL'] || input[field['NAME']]
        :
      input[field['NAME']] + (field['UNIT'] ? ' ' + field['UNIT'] : '')
    return (
      <div className="result-section_source" key={index}>
        <div className="result-section_source-name">{fieldName}</div>
        <div className="result-section_source-value">{fieldValue}</div>
      </div>
    )
  })

  let dataSquare = {
    label: model['LABEL_TO_PREDICT']['LABEL'] || model['LABEL_TO_PREDICT']['NAME'],
    name: model['LABEL_TO_PREDICT']['NAME'],
    value: result,
    unit: {
      name: model['LABEL_TO_PREDICT']['UNIT'],
      accuracy: model['LABEL_TO_PREDICT']['ACCURACY']
    },
    alternativeUnits: model['LABEL_TO_PREDICT']['ALTERNATIVE_UNITS'].map(unit => (
      { name: unit['UNIT'], rate: unit['RATE'], accuracy: unit['ACCURACY']}
    ))    
  }

  return (
    <div className={'result-section' + layoutStyle}>
      <div className='result-section_sources'>
        <div className='result-section_sources-title'>Input data</div>        
        {sourceFields}
      </div>
      <div className="result-section_results">
        <DataSquare {...dataSquare} />
      </div>
      
    </div>
  )
}
ResultSection.defaultProps = {
  layout: 'column'
}
  
export default ResultSection
