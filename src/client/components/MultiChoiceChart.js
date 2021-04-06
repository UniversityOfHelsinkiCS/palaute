import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useTranslation } from 'react-i18next'

const MultiChoiceChart = ({ answers }) => {
  const { t } = useTranslation()

  const filteredAnswers = answers
    .filter((number) => !Number.isNaN(number - parseInt(number, 10)))
    .map((number) => parseInt(number, 10))

  if (filteredAnswers.length === 0) {
    return <p>{t('feedbackList:notEnoughFeedbacks')}</p>
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
        text: t('feedbackList:amount'),
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
      {t('feedbackList:answers')}: {filteredAnswers.length} <br />
      {t('feedbackList:average')}: {averageValue()}
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}

export default MultiChoiceChart
