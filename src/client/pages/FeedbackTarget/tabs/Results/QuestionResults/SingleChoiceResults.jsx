import React from 'react'
import 'chart.js/auto'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import { getSingleChoiceChartConfig } from './utils'
import ResultsContent from './ResultsContent'
import AccessibleChartTable from './AccessibleChartTable'

const SingleChoiceResults = ({ question, feedbackCount }) => {
  const { t, i18n } = useTranslation()
  const config = getSingleChoiceChartConfig(question, i18n.language, t, feedbackCount)

  const table = (
    <AccessibleChartTable
      labels={config.data.labels}
      data={config.data.datasets[0].data}
      totalFeedbacks={feedbackCount}
      ariaDescription="Table showing the distribution of responses for the single choice question"
    />
  )

  return <ResultsContent chart={<Bar {...config} />} table={table} chartLabel="Single Choice Responses" />
}

export default SingleChoiceResults
