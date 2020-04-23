import React from 'react'
import ResultSection from '../src/components/result-section'
import Window from '../src/components/window'

export default { 
  title: 'ResultSection',
  component: ResultSection
}

let sources = {
  height: '1.72',
  weight: '67',
  age: '24',
  sex: 'm'
}
let result = {
  name: 'BMR',
  values: [
    {
      unit: 'MJ/day',
      value: 9.36
    },
    {
      unit: 'KCal/day',
      value: 2235
    }
  ]
}
export const ResultSectionStory = () => 
  <Window width='150px' title='Results'>
    <ResultSection sources={sources} result={result} />
  </Window>

export const row = () => 
<Window title='Results'>
  <ResultSection layout='row' sources={sources} result={result} />
</Window>

  