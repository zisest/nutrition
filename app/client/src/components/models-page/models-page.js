import React, { useEffect, useState } from 'react'
import './models-page.css'
import Navbar from '../navbar'  

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

  return (
    <div className='models-page'>
      <div className='models-page_navbar'>
        <Navbar title='Models'>
        
        </Navbar>
      </div>
      <div className='models-page_main-area'>
        
      </div>
    </div>
  )
}
ModelsPage.defaultProps = { }
  
export default ModelsPage
