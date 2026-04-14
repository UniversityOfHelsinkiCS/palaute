import React from 'react'
import 'chart.js/auto'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import { getLikertChartConfig } from './utils'
import ResultsContent from './ResultsContent'
import AccessibleChartTable from './AccessibleChartTable'

const LikertResults = ({ question, feedbackCount, showTable, setShowTable }) => {
  const { t, i18n } = useTranslation()
  const config = getLikertChartConfig(question, i18n.language, t, feedbackCount)

  const dontKnowOption = t('feedbackView:dontKnowOption')
  const tableLabels = ['5', '4', '3', '2', '1', dontKnowOption].map(l => [l])

  const table = (
    <AccessibleChartTable labels={tableLabels} data={config.data.datasets[0].data} totalFeedbacks={feedbackCount} />
  )

  return <ResultsContent chart={<Bar {...config} />} table={table} showTable={showTable} setShowTable={setShowTable} />
}

export default LikertResults
