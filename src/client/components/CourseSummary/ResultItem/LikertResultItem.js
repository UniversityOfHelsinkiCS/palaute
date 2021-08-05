import React from 'react'
import { makeStyles } from '@material-ui/core'
import PlusIcon from '@material-ui/icons/Add'
import MinusIcon from '@material-ui/icons/Remove'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../util/languageUtils'
import ResultItemBase from './ResultItemBase'

const useStyles = makeStyles({
  content: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    lineHeight: 2,
  },
  indicator: {
    marginRight: '4px',
  },
})

const getDifferenceIndicator = ({ mean, previous, className }) => {
  if (!mean || !previous?.mean) {
    return null
  }

  const meanDifference = mean - previous.mean

  if (meanDifference <= -1) {
    return <MinusIcon fontSize="small" className={className} />
  }

  if (meanDifference >= 1) {
    return <PlusIcon fontSize="small" className={className} />
  }

  return null
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
  const classes = useStyles()
  const { t, i18n } = useTranslation()

  const questionLabel = getLanguageValue(question?.data?.label, i18n.language)

  const tooltipTitle = `${questionLabel}: ${
    mean === null ? t('courseSummary:noResults') : mean
  }`

  const differenceIndicator = getDifferenceIndicator({
    mean,
    previous,
    className: classes.indicator,
  })

  return (
    <ResultItemBase
      tooltipTitle={tooltipTitle}
      color={getColor(mean)}
      {...props}
    >
      <div className={classes.content}>
        {differenceIndicator}
        <span>{mean ?? 0}</span>
      </div>
    </ResultItemBase>
  )
}

export default LikertResultItem
