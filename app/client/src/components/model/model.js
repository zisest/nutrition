import React, { useState, useEffect } from 'react'
import './model.css'
import {
  BrowserRouter as Router,
  useParams,
  Redirect
} from 'react-router-dom'
import Form from '../form'
import Window from '../window'
import ResultSection from '../result-section'
import ModelInfoSection from '../model-info-section'

const parseModel = (model) => {
  let fields = model['SOURCE_FIELDS'].map(field => {
    if (!field['CATEGORIAL']) 
      return { 
        name: field['NAME'],
        label: (field['LABEL'] || field['NAME']) + (field['UNIT'] && ` (${field['UNIT']})`),
        type: 'text',
        regex: "^-?([0-9]+([.][0-9]*)?|[.][0-9]+)$",
        required: true,
        maxLength: 5,
        placeholder: field['DEFAULT_VALUE']
      }
    else 
      return {
        name: field['NAME'],
        label: field['LABEL'] || field['NAME'],
        type: 'radio',
        options: field['VALUES'].map(opt => Object.fromEntries(Object.entries(opt).map(([k, v]) => [k.toLowerCase(), v]))),
        initialValue: field['DEFAULT_VALUE']
      }    
  })  
  
  return(fields)
}

function Model({ model }) {
  const [request, setRequest] = useState(null)
  const [result, setResult] = useState(null)
  
  
  if (!model) return <Redirect to='/models' />

  const dataToSend = {MODEL_NAME: model.MODEL_NAME}

  const handleResponse = (req, res) => {
    Object.keys(dataToSend).forEach(key => {
      delete req[key]
    })
    setRequest(req)
    setResult(+res)    
  }

  let form = <Form 
    fields={parseModel(model)}
    columns={2} 
    dataToSend={dataToSend}
    submitUrl='/api/predict' 
    formTitle={model.MODEL_TITLE || model.MODEL_NAME}
    onResponse={handleResponse}
  />
  
  let resultSection = result && request && 
    <Window  title='Results'>
      <ResultSection 
        input={request}
        model={model} 
        result={result} 
        layout='col'
      />
    </Window>

    
  
  return (
    <div className='model'>
      <Window width='500px' className='model-info-window'><ModelInfoSection model={model} /> </Window>
      <Window blank width='420px'>{form}</Window>
      {resultSection}
      {/*Object.keys(requests[model.MODEL_NAME]).map(key=>requests[model.MODEL_NAME][key])*/}
    </div>
  )
}
Model.defaultProps = {
  
}
  
export default Model
export { parseModel }
