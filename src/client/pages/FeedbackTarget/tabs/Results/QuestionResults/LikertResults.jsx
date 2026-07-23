import React from 'react'
import 'chart.js/auto'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import AccessibleChartTable from './AccessibleChartTable'
import ResultsContent from './ResultsContent'
import { getLikertChartConfig } from './utils'

const LikertResults = ({ question, feedbackCount, showTable }) => {
  const { t, i18n } = useTranslation()
  const config = getLikertChartConfig(question, i18n.language, t, feedbackCount)

  const dontKnowOption = t('feedbackView:dontKnowOption')
  const tableLabels = ['5', '4', '3', '2', '1', dontKnowOption].map(l => [l])

  const table = (
    <AccessibleChartTable
      labels={tableLabels}
      data={config.data.datasets[0].data}
      totalFeedbacks={feedbackCount}
      question={question}
    />
  )

  return <ResultsContent chart={<Bar {...config} />} table={table} showTable={showTable} />
}

export default LikertResults
