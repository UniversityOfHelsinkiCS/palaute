import React from 'react'
import 'chart.js/auto'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import { getLikertChartConfig } from './utils'
import ResultsContent from './ResultsContent'

const LikertResults = ({ question, feedbackCount }) => {
  const { t, i18n } = useTranslation()
  const config = getLikertChartConfig(question, i18n.language, t, feedbackCount)

  return <ResultsContent chart={<Bar {...config} />} />
}

export default LikertResults
