import React from 'react'
import './result-section.css'
  
function ResultSection({ sources, result, layout }) {
  let layoutStyle = layout === 'row' ? ' result-section__row' : ''

  let sourceFields = Object.keys(sources).map((key, index) => (
    <div className="result-section_source" key={index}>
      <div className="result-section_source-name">{key}</div>
      <div className="result-section_source-value">{sources[key]}</div>
    </div>
  ))
  let resultFields = result.values.map((res, index) => (
    <div className="result-secton_result" key={index}>{res.value + ' ' + res.unit}</div>
  ))

  return (
    <div className={'result-section' + layoutStyle}>
      <div className='result-section_sources'>
        <div className='result-section_sources-title'>Input data</div>        
        {sourceFields}
      </div>
      <div className='result-section_results'>
        <div className='result-section_results-title'>{result.name}</div>
        <div className="result-section_results-fields">{resultFields}</div>        
        
      </div>
    </div>
  )
}
ResultSection.defaultProps = {
  layout: 'column'
}
  
export default ResultSection
