import React from 'react'
import './model-info-section.css'
import { ResponsiveScatterPlotCanvas } from '@nivo/scatterplot'


function ModelInfoSection({ model }) {
  let points = []
  model && model['PREDICTED_VALUES'].forEach((val, index) => {
    points.push({'x': val, 'y': model['TRUE_VALUES'][index]})
  })
  let data = [{
    id: 'BMR',
    data: points
  }]

  return (
    <div className='model-info-section'>
    <ResponsiveScatterPlotCanvas
        data={data}
        margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
        xScale={{ type: 'linear', min: 0, max: 'auto' }}
        xFormat={function(e){return e.toFixed(3)+" MJ/d"}}
        yScale={{ type: 'linear', min: 0, max: 'auto' }}
        yFormat={function(e){return e.toFixed(3)+" MJ/d"}}
        nodeSize={2}
        colors={'#A4145A'}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Predictions',
            legendPosition: 'middle',
            legendOffset: 35
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Real values',
            legendPosition: 'middle',
            legendOffset: -35
        }}
    />
    </div>
  )
}
ModelInfoSection.defaultProps = { }
  
export default ModelInfoSection


