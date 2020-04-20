import React, { useEffect, useState } from 'react'
import { Link, Switch, Route } from 'react-router-dom'
import './models-page.css'
import Navbar from '../navbar'  
import Model from '../model'

const FETCH_URL = '/api/getModels'

function ModelsPage() {
  const [models, setModels] = useState([])

  useEffect(() => {
    fetch(FETCH_URL)
    .then(res => res.json())
    .then(res => {
      setModels(res)
    })
    .catch(err => console.error('ERROR: ', err))
  }, [])

  let modelElements = models.map((model, index) => 
    <Link to={'/models/' + model.MODEL_NAME}>
    <div className='model-link' key={index}>
      <div className='model-link_name'>
        {model.MODEL_NAME}
      </div>
      <div className='model-link_description'>
        {model.MODEL_DESCRIPTION}
      </div>
    </div>
    </Link>
  )

  return (
    <div className='models-page'>
      <div className='models-page_navbar'>
        <Navbar title='Models'>
          {modelElements}
        </Navbar>
      </div>
      <div className='models-page_main-area'>
      <Switch>
        <Route path="/models/:modelName" children={<Model models={models} />} />
      </Switch>
      </div>
    </div>
  )
}
ModelsPage.defaultProps = { }
  
export default ModelsPage
