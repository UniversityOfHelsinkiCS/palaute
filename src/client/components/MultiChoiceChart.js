import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

const MultiChoiceChart = ({ question, answers }) => {
  if (answers.length === 0) {
    return null
  }

  const averageValue = () => answers.reduce((a, b) => a + b, 0) / answers.length

  const options = {
    chart: {
      type: 'column',
    },
    title: {
      text: '',
    },
    xAxis: {
      type: 'category',
    },
    yAxis: {
      title: {
        text: 'Määrä',
      },
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.y}',
        },
      },
    },
    series: [
      {
        name: '',
        colorByPoint: false,
        data: [
          {
            name: '1',
            y: answers.filter((x) => x === 1).length,
          },
          {
            name: '2',
            y: answers.filter((x) => x === 2).length,
          },
          {
            name: '3',
            y: answers.filter((x) => x === 3).length,
          },
          {
            name: '4',
            y: answers.filter((x) => x === 4).length,
          },
          {
            name: '5',
            y: answers.filter((x) => x === 5).length,
          },
        ],
      },
    ],
  }

  return (
    <div>
      <h4>{question.question.fi}</h4>
      Vastauksia: {answers.length} <br />
      Keskiarvo: {averageValue()}
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}

export default MultiChoiceChart
