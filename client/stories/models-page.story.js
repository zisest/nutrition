import React from 'react'
import ModelsPage from '../src/components/models-page'
import StoryRouter from 'storybook-react-router'

export default { 
  title: 'ModelsPage',
  component: ModelsPage,
  decorators: [StoryRouter()]
}

export const ModelsPageStory = () => <ModelsPage />