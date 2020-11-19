import React from 'react'
import MultiButton from '../src/components/multi-button'
import SimpleButton from '../src/components/simple-button'
import { ReactComponent as TrashcanIcon } from '../src/assets/trashcan.svg'

export default { 
  title: 'MultiButton',
  component: MultiButton
}

export const MultiButtonStory = () => 
  <div style={ { width: '300px', display: 'grid', gap: '10px' } }>
  <MultiButton color='red'>
    <SimpleButton color='red' withFlatSide='right' isIcon>🍋</SimpleButton>
    Текст
    <SimpleButton color='red' withFlatSide='left'>Нажать</SimpleButton>
  </MultiButton>

  <MultiButton color='faint-red'>
    <SimpleButton color='faint-red' withFlatSide='right' isIcon>🍋</SimpleButton>
    Текст
    <SimpleButton color='faint-red' withFlatSide='left'>Нажать</SimpleButton>
  </MultiButton>
  <MultiButton color='grey'>
    <SimpleButton color='grey' withFlatSide='right' isIcon>🍋</SimpleButton>
    Текст
    <SimpleButton color='grey' withFlatSide='left'>Нажать</SimpleButton>
  </MultiButton>
  <MultiButton color='faint-grey'>
    <SimpleButton color='faint-grey' withFlatSide='right' isIcon>🍋</SimpleButton>
    Текст
    <SimpleButton color='faint-grey' withFlatSide='left'>Нажать</SimpleButton>
  </MultiButton>
  <MultiButton color='red'>
    Удалить клиента?
    <SimpleButton isIcon color='red' withFlatSide='left'><TrashcanIcon /></SimpleButton>
  </MultiButton>
  </div>
  