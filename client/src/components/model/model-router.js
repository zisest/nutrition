import React, { useState, useEffect } from 'react'
import './model.css'
import {
  BrowserRouter as Router,
  useParams,
  Redirect
} from 'react-router-dom'
import Model from './model'


function ModelRouter({ models }) {
  const [results, setResults] = useState({})
  const [requests, setRequests] = useState({})

  const handleResponse = (modelName, req, res) => {
    setRequests(prev => ({...prev, [modelName]: req}))
    setResults(prev => ({...prev, [modelName]: res}))
  }

  let { modelName } = useParams()
  let model = models.find(m => m['MODEL_NAME'] === modelName)
  useEffect(() => {
    console.log('Model rerender')
  }, [model])  
  if (!model) return <Redirect to='/models' />

  
  return (
    <Model model={model} result={results[modelName]} request={requests[modelName]} onResponse={handleResponse} />
  )
}
ModelRouter.defaultProps = {
  
}
  
export default ModelRouter
