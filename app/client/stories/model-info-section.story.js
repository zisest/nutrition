import React, {useEffect, useState} from 'react'
import ModelInfoSection from '../src/components/model-info-section'
import Window from '../src/components/window'

export default { 
  title: 'ModelInfoSection',
  component: ModelInfoSection
}

const Wrapper = (props) => {
  const [models, setModels] = useState([])

  useEffect(() => {
    fetch('/api/getModels')
    .then(res => res.json())
    .then(res => {
      setModels(res)
    })
    .catch(err => console.error('ERROR: ', err))
  }, [])

  return <ModelInfoSection model={models[0]} />
}



export const ModelInfoSectionStory = () => 
  <Window title='Model info'>
    <Wrapper />
  </Window>