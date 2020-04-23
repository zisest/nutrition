import React from 'react'
import './result-section.css'
  
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
 
  let mainRes = <div className="result-secton_result">
      {result.toFixed(model['LABEL_TO_PREDICT']['ACCURACY'] || 2) + ' ' + model['LABEL_TO_PREDICT']['UNIT']}
    </div>
  let altUnits = model['LABEL_TO_PREDICT']['ALTERNATIVE_UNITS'].map((unit, index) => (
    <div className="result-secton_result" key={index}>
      {(result*unit['RATE']).toFixed(unit['ACCURACY'] || 2) + ' ' + unit['UNIT']}
    </div>
  ))
   

  return (
    <div className={'result-section' + layoutStyle}>
      <div className='result-section_sources'>
        <div className='result-section_sources-title'>Input data</div>        
        {sourceFields}
      </div>
      <div className='result-section_results'>
        <div className='result-section_results-title'>{model['LABEL_TO_PREDICT']['LABEL'] || model['LABEL_TO_PREDICT']['NAME']}</div>
        <div className="result-section_results-fields">{[mainRes, ...altUnits]}</div>                
      </div>
    </div>
  )
}
ResultSection.defaultProps = {
  layout: 'column'
}
  
export default ResultSection
