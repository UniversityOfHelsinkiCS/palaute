import React from 'react'
import 'chart.js/auto'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import AccessibleChartTable from './AccessibleChartTable'
import ResultsContent from './ResultsContent'
import { getMultipleChoiceChartConfig } from './utils'

const MultipleChoiceResults = ({ question, feedbackCount, showTable }) => {
  const { t, i18n } = useTranslation()
  const config = getMultipleChoiceChartConfig(question, i18n.language, t, feedbackCount)

  const table = (
    <AccessibleChartTable
      labels={config.data.labels}
      data={config.data.datasets[0].data}
      totalFeedbacks={feedbackCount}
      question={question}
    />
  )

  return <ResultsContent chart={<Bar {...config} />} table={table} showTable={showTable} />
}

export default MultipleChoiceResults
