import React from 'react'
import 'chart.js/auto'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import { getSingleChoiceChartConfig } from './utils'
import { getLanguageValue } from '../../../util/languageUtils'
import ResultsContent from './ResultsContent'

const SingleChoiceResults = ({ question, feedbackCount }) => {
  const { t, i18n } = useTranslation()
  const config = getSingleChoiceChartConfig(
    question,
    i18n.language,
    t,
    feedbackCount,
  )
  const label = getLanguageValue(question.data?.label, i18n.language)

  const description = getLanguageValue(
    question.data?.description,
    i18n.language,
  )

  return (
    <ResultsContent
      title={label}
      description={description}
      chart={<Bar {...config} />}
    />
  )
}

export default SingleChoiceResults
