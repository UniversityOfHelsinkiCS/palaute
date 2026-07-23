import { Box, Typography } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { countBy, round } from 'lodash-es'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { getArrow } from '../../../../../components/SummaryResultItem/WorkloadResultItem'
import { getLanguageValue } from '../../../../../util/languageUtils'
import { getColor } from '../../../../../util/resultColors'

const styles = {
  resultItem: {
    width: '3rem',
    height: '3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '0.4rem',
    textAlign: 'center',
    position: 'relative',
    color: 'black',
  },
  content: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    lineHeight: 2,
  },
}

const getDistribution = feedbacks => countBy(feedbacks, f => String(f.data))

const getLikertMean = distribution => {
  const entries = [
    distribution['1'] || 0,
    distribution['2'] || 0,
    distribution['3'] || 0,
    distribution['4'] || 0,
    distribution['5'] || 0,
  ]

  // hack to convert possible strings to numbers when doing math
  const totalCount = -(-entries[0] - entries[1] - entries[2] - entries[3] - entries[4])

  if (totalCount === 0) return 0

  let sum = 0
  for (let i = 0; i < entries.length; i++) {
    const count = entries[i]
    const value = i + 1
    sum += value * count
  }

  return round(sum / totalCount, 2)
}

const getSingleChoiceMean = (distribution, question) => {
  const entries = []

  for (let i = 0; i < question.data.options.length; i++) {
    const optionId = question.data.options[i].id
    entries.push(distribution[optionId] || 0)
  }

  // hack to convert possible strings to numbers when doing math
  const totalCount = -(-entries[0] - entries[1] - entries[2] - entries[3] - entries[4])

  if (totalCount === 0) return 0

  let sum = 0
  for (let i = 0; i < entries.length; i++) {
    const count = entries[i]
    const value = i + 1
    sum += value * count
  }

  return round(sum / totalCount, 2)
}

const getMean = (question, distribution) => {
  switch (question.type) {
    case 'LIKERT':
      return getLikertMean(distribution)
    case 'SINGLE_CHOICE':
      return getSingleChoiceMean(distribution, question)
    default:
      return 0
  }
}

const getBackgroundColor = (mean, questionSecondaryType) => {
  const meanValue = questionSecondaryType === 'WORKLOAD' ? 5.0 - Math.abs((mean - 3) * 2.0) : mean
  return getColor(meanValue)
}

export const getMeanOption = (mean, question) => {
  if (!question?.data?.options?.length) return null

  let index = Math.round(mean) - 1
  index = Math.max(0, Math.min(index, question.data.options.length - 1))

  return question.data.options[index]
}

const AverageResult = ({ question }) => {
  const { t, i18n } = useTranslation()
  const distribution = getDistribution(question.feedbacks)
  const isWorkloadQuestion = question.secondaryType === 'WORKLOAD'

  const mean = getMean(question, distribution)
  const fixedMean = mean?.toFixed(2) || 0

  const meanText = isWorkloadQuestion
    ? getLanguageValue(getMeanOption(mean, question)?.label, i18n.language)
    : fixedMean
  const screenReaderText = `${t('feedbackSummary:average')}: ${fixedMean > 0 ? meanText : t('courseSummary:noResults')}`

  return (
    <>
      <Box
        sx={{ backgroundColor: getBackgroundColor(mean, question.secondaryType), ...styles.resultItem }}
        aria-hidden="true"
      >
        {isWorkloadQuestion && (fixedMean > 0 ? getArrow(mean) : '–')}
        {!isWorkloadQuestion && (
          <Box sx={styles.content}>
            <Typography fontWeight="500">{fixedMean > 0 ? fixedMean : '–'}</Typography>
          </Box>
        )}
      </Box>
      <Box component="span" sx={{ ...visuallyHidden, width: '0px', height: '0px' }}>
        {screenReaderText}
      </Box>
    </>
  )
}

export default AverageResult
