import React from 'react'
import SimpleButton from '../src/components/simple-button'

export default { 
  title: 'SimpleButton',
  component: SimpleButton
}

export const SimpleButtonStory = () => 
  <div style={ { width: '250px', display: 'grid', gap: '10px' } }>
    <SimpleButton />
    <SimpleButton color='grey' />
    <SimpleButton color='faint-grey' />
    <SimpleButton color='red' />
    <SimpleButton color='faint-red' />
    <SimpleButton withFlatSide='left' />
    <SimpleButton withFlatSide='right' />
    <SimpleButton withFlatSide='both' />
    <SimpleButton isIcon>🍋</SimpleButton>
    <SimpleButton isUnclickable>a</SimpleButton>

  </div>