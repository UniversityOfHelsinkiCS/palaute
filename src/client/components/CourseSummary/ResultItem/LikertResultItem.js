import React from 'react'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../util/languageUtils'
import ResultItemBase from './ResultItemBase'

const styles = {
  content: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    lineHeight: 2,
  },
}

const getColor = (mean) => {
  if (!mean) {
    return 'missing'
  }

  if (mean >= 4.5) {
    return 'excellent'
  }

  if (mean >= 3.5) {
    return 'good'
  }

  if (mean >= 2.5) {
    return 'ok'
  }

  if (mean >= 2) {
    return 'poor'
  }

  if (mean < 2) {
    return 'bad'
  }

  return 'missing'
}

const LikertResultItem = ({ mean, previous, question, ...props }) => {
  const { t, i18n } = useTranslation()

  const questionLabel = getLanguageValue(question?.data?.label, i18n.language)

  const tooltipTitle = `${questionLabel}: ${
    mean || t('courseSummary:noResults')
  }`

  return (
    <ResultItemBase
      tooltipTitle={tooltipTitle}
      color={getColor(mean)}
      {...props}
    >
      <div style={styles.content}>
        <span>{mean || '–'}</span>
      </div>
    </ResultItemBase>
  )
}

export default LikertResultItem
