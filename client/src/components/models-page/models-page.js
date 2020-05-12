import React, { useEffect, useState } from 'react'
import { Link, Switch, Route } from 'react-router-dom'
import './models-page.css'
import Navbar from '../navbar'  
import {ModelRouter} from '../model'
import ModelLink from '../model-link'

const FETCH_URL = '/api/get_models/'

function ModelsPage() {
  const [models, setModels] = useState(null)

  useEffect(() => {
    fetch(FETCH_URL)
    .then(res => res.json())
    .then(res => {
      setModels(res)
    })
    .catch(err => console.error('ERROR: ', err))
  }, [])

  let modelLinks = models && models.map((model, index) => 
    <ModelLink key={index}
      name={model.MODEL_NAME} 
      title={model.MODEL_TITLE || model.MODEL_NAME} 
      description={model.MODEL_DESCRIPTION} 
      to={'/models/' + model.MODEL_NAME}
    />
  )

  return (
    <div className='models-page'>
      <div className='models-page_navbar'>
        <Navbar title='Models' size='350px' >
          {modelLinks}
        </Navbar>
      </div>
      <div className='models-page_main-area'>
      <Switch>
        <Route exact path='/models' />
        <Route path='/models/:modelName' children={models && <ModelRouter models={models} />} />
      </Switch>
      </div>
    </div>
  )
}
ModelsPage.defaultProps = { }
  
export default ModelsPage
