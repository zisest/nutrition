import React, { useState, useEffect } from 'react'
import Model from '../src/components/model'
import StoryRouter from 'storybook-react-router'

export default { 
  title: 'Model',
  component: Model,
  decorators: [StoryRouter()]
}

const Wrapper = (props) => {
  const [models, setModels] = useState([])

  useEffect(() => {
    fetch('/api/get_models/')
    .then(res => res.json())
    .then(res => {
      setModels(res)
    })
    .catch(err => console.error('ERROR: ', err))
  }, [])

  return <Model model={models[0]} />
}

export const ModelStory = () => <Wrapper />