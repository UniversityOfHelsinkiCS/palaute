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

  const countOccurrences = (val) =>
    filteredAnswers.filter((num) => num === val).length

  const formData = (value) => ({
    name: value,
    y: countOccurrences(value),
  })

  const options = {
    chart: {
      type: 'column',
    },
    credits: {
      enabled: false,
    },
    title: {
      text: '',
    },
    xAxis: {
      type: 'category',
    },
    yAxis: {
      allowDecimals: false,
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
        data: [formData(1), formData(2), formData(3), formData(4), formData(5)],
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
