import React from 'react'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import { getSingleChoiceChartData } from './utils'
import { getLanguageValue } from '../../util/languageUtils'
import ResultsContent from './ResultsContent'

const SingleChoiceResults = ({ question }) => {
  const { i18n } = useTranslation()
  const data = getSingleChoiceChartData(question, i18n.language)
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

export default SingleChoiceResults
