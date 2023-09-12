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

const LikertResultItem = ({ mean, previous, question, ...props }) => {
  const { t, i18n } = useTranslation()

  const questionLabel = getLanguageValue(question?.data?.label, i18n.language)

  const fixedMean = mean?.toFixed(2)

  const tooltipTitle = `${questionLabel}: ${fixedMean || t('courseSummary:noResults')}`

  return (
    <ResultItemBase tooltipTitle={tooltipTitle} mean={mean} {...props}>
      <div style={styles.content}>
        <Typography fontWeight="500">{fixedMean || '–'}</Typography>
      </div>
    </ResultItemBase>
  )
}

export default LikertResultItem
