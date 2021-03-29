import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

const MultiChoiceChart = ({ answers }) => {
  const filteredAnswers = answers
    .filter((number) => !Number.isNaN(number - parseInt(number, 10)))
    .map((number) => parseInt(number, 10))

  if (filteredAnswers.length === 0) {
    return <p>Palautteita on liian vähän näytettäväksi</p>
  }

  const averageValue = () =>
    (
      filteredAnswers.reduce((a, b) => a + b, 0) / filteredAnswers.length
    ).toFixed(2)

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
            y: filteredAnswers.filter((x) => x === 1).length,
          },
          {
            name: '2',
            y: filteredAnswers.filter((x) => x === 2).length,
          },
          {
            name: '3',
            y: filteredAnswers.filter((x) => x === 3).length,
          },
          {
            name: '4',
            y: filteredAnswers.filter((x) => x === 4).length,
          },
          {
            name: '5',
            y: filteredAnswers.filter((x) => x === 5).length,
          },
        ],
      },
    ],
  }

  return (
    <div>
      Vastauksia: {filteredAnswers.length} <br />
      Keskiarvo: {averageValue()}
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}

export default MultiChoiceChart
