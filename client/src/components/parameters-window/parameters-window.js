import React from 'react'
import './parameters-window.css'

import Window from '../window'
import Form from '../form'
import SimpleButton from "../simple-button"
import { ReactComponent as HelpIcon } from '../../assets/help-icon.svg'
import { MethodsIcon } from "../icons";

function ParametersWindow() {
  const fields = [
    {
      type: 'text',
      name: 'weight',
      label: 'масса'
    },
    {
      type: 'text',
      name: 'height',
      label: 'рост'
    },
    {
      type: 'text',
      name: 'age',
      label: 'возраст'
    },
    {
      type: 'radio',
      options: [{name: 'm', label: 'м'}, {name: 'f', label: 'ж'}],
      name: 'sex',
      label: 'пол',
      initialValue: 'm'
    },
    {
      type: 'select',
      name: 'PAL',
      label: 'Уровень физ. активности',
      options: [{name: 'lose', label: 'Снижение веса', description: 'Lorem ipsum dolor sit amet, consec tetuer adipiscing elit. Aenean commodoig ula eget dolor. Enean massa. Cum sociis natoque penatibus et magnis. Aenean commodoig ula eget dolor. Enean massa. Cum sociis natoque penatibus et magnis'}],
      initialValue: 'lose',
      double: true
    },
    {
      type: 'slider',
      name: 'goal',
      label: 'Цель',
      options: [{name: 'lose', label: 'Снижение веса', description: '11'}],
      initialValue: 'lose'
    },
  ]
  const sections = [
    {
      title: 'Параметры',
      size: 4,
      columns: 2
    },
    {
      title: 'Физ. активность',
      size: 2,
      columns: 1
    }
  ]

  return (
    <div className='parameters-window'>
      <Window width='310px' cornerIcon={<HelpIcon />} >
        <Form withoutButton fields={fields} sections={sections} />
        <div className="delimeter-h-15"></div>
        <div className="parameters-window_buttons">
          <SimpleButton>Рассчитать</SimpleButton>
          <MethodsIcon />
        </div>

      </Window>
    </div>
  )
}
ParametersWindow.defaultProps = { }
  
export default ParametersWindow
