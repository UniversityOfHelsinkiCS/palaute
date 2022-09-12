import React from 'react'
import 'chart.js/auto'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import { getMultipleChoiceChartConfig } from './utils'
import { getLanguageValue } from '../../../util/languageUtils'
import ResultsContent from './ResultsContent'

const MultipleChoiceResults = ({ question }) => {
  const { t, i18n } = useTranslation()
  const config = getMultipleChoiceChartConfig(question, i18n.language, t)
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

export default MultipleChoiceResults
