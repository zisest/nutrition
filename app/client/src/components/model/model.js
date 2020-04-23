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

const parseModel = (model) => {
  let fields = model['SOURCE_FIELDS'].map(field => {
    if (!field['CATEGORIAL']) 
      return { 
        name: field['NAME'],
        label: (field['LABEL'] || field['NAME']) + (field['UNIT'] && ` (${field['UNIT']})`),
        type: 'text',
        regex: /^-?([0-9]+([.][0-9]*)?|[.][0-9]+)$/,
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

function Model({ models }) {
  const [requests, setRequests] = useState({})
  const [results, setResults] = useState({})
  
  let { modelName } = useParams()
  let model = models.find(m => m['MODEL_NAME'] === modelName)
  useEffect(() => {
    console.log('Model rerender')
  }, [model])  
  if (!model) return <Redirect to='/models' />

  const dataToSend = {MODEL_NAME: model.MODEL_NAME}

  const handleResponse = (req, res) => {
    Object.keys(dataToSend).forEach(key => {
      delete req[key]
    })
    setRequests(prev => ({...prev, [model.MODEL_NAME]: req}))
    setResults(prev => ({...prev, [model.MODEL_NAME]: +res}))    
  }

  let form = <Form 
    fields={parseModel(model)}
    columns={2} 
    dataToSend={dataToSend}
    submitUrl='/api/predict' 
    formTitle={model.MODEL_TITLE || model.MODEL_NAME}
    onResponse={handleResponse}
  />
  
  let resultSection = (results[model.MODEL_NAME] && requests[model.MODEL_NAME]) && 
    <Window  title='Results'>
      <ResultSection 
        input={requests[model.MODEL_NAME]}
        model={model} 
        result={results[model.MODEL_NAME]} 
        layout='row'
      />
    </Window>

    
  
  return (
    <div className='model'>
      <Window blank width='420px'>{form}</Window>
      {resultSection}
      {/*Object.keys(requests[model.MODEL_NAME]).map(key=>requests[model.MODEL_NAME][key])*/}
    </div>
  )
}
Model.defaultProps = {
  
}
  
export default Model
