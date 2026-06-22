import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
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

const LikertResultItem = ({ mean, question, ...props }) => {
  const { t, i18n } = useTranslation()

  const questionLabel = getLanguageValue(question?.data?.label, i18n.language)

  const fixedMean = mean?.toFixed(2) || 0

  const meanText = fixedMean > 0 ? fixedMean : t('courseSummary:noResults')
  const tooltipTitle = `${questionLabel}: ${meanText}`

  return (
    <ResultItemBase tooltipTitle={tooltipTitle} mean={mean} {...props}>
      <div style={styles.content}>
        <Typography fontWeight="500">{fixedMean > 0 ? fixedMean : '–'}</Typography>
      </div>
    </ResultItemBase>
  )
}

export default LikertResultItem
