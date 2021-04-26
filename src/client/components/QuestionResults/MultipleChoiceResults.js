import React from 'react'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import { getMultipleChoiceChartData } from './utils'
import { getLanguageValue } from '../../util/languageUtils'
import ResultsContent from './ResultsContent'

const MultipleChoiceResults = ({ question }) => {
  const { i18n } = useTranslation()
  const data = getMultipleChoiceChartData(question, i18n.language)
  const label = getLanguageValue(question.data?.label, i18n.language)

  const description = getLanguageValue(
    question.data?.description,
    i18n.language,
  )

  return (
    <ResultsContent
      title={label}
      description={description}
      chart={<Bar data={data} />}
    />
  )
}

export default MultipleChoiceResults
