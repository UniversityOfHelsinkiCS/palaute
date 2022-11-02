import React from 'react'
import 'chart.js/auto'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import { getSingleChoiceChartConfig } from './utils'
import ResultsContent from './ResultsContent'

const SingleChoiceResults = ({ question, feedbackCount }) => {
  const { t, i18n } = useTranslation()
  const config = getSingleChoiceChartConfig(
    question,
    i18n.language,
    t,
    feedbackCount,
  )

  return <ResultsContent chart={<Bar {...config} />} />
}

export default SingleChoiceResults
