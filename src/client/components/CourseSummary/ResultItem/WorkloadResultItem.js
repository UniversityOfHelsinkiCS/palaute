import React from 'react'
import { Box } from '@mui/material'
import ArrowIcon from '@mui/icons-material/TrendingFlat'
import { useTranslation } from 'react-i18next'
import { sumBy, isEmpty, round } from 'lodash'

import { getLanguageValue } from '../../../util/languageUtils'
import ResultItemBase from './ResultItemBase'

const normalizeMean = (mean) => {
  const diff = Math.abs(mean - 3)

  return diff / 2
}

const getArrow = (mean) => {
  const normalizedMean = normalizeMean(mean)

  const angle = mean < 3 ? -(normalizedMean * 90) : normalizedMean * 90

  return <ArrowIcon style={{ transform: `rotate(${angle}deg)` }} />
}

const getColor = (mean) => {
  if (!mean) {
    return 'missing'
  }

  if (mean <= 1.5 || mean >= 4.5) {
    return 'bad'
  }

  if (mean <= 2 || mean >= 4) {
    return 'poor'
  }

  if (mean <= 2.5 || mean >= 3.5) {
    return 'ok'
  }

  if (mean <= 2.75 || mean >= 3.25) {
    return 'good'
  }

  if (mean >= 2.75 && mean <= 3.25) {
    return 'excellent'
  }

  return 'missing'
}

const getTooltipData = (distribution, question) => {
  const labelByQuestionId = (question.data?.options ?? []).reduce(
    (acc, curr) => ({
      ...acc,
      [curr.id]: curr.label,
    }),
    {},
  )

  const entries = Object.entries(distribution)
  const totalCount = sumBy(entries, ([, count]) => count)

  return entries.map(([id, count]) => ({
    id,
    percentage: count / totalCount,
    label: labelByQuestionId[id],
  }))
}

const WorkloadResultItem = ({
  mean,
  distribution,
  previous,
  question,
  ...props
}) => {
  const { t, i18n } = useTranslation()

  const hasValue = !isEmpty(distribution)

  const tooltipData = hasValue ? getTooltipData(distribution, question) : null

  const questionLabel = getLanguageValue(question?.data?.label, i18n.language)

  const tooltipTitle = (
    <>
      <Box mb={1}>{questionLabel}:</Box>
      {tooltipData ? (
        tooltipData.map(({ id, label, percentage }) => (
          <div key={id}>
            {getLanguageValue(label, i18n.language) ?? '-'}:{' '}
            {round(percentage * 100, 0)}%
          </div>
        ))
      ) : (
        <div>{t('courseSummary:noResults')}</div>
      )}
    </>
  )

  return (
    <ResultItemBase
      color={getColor(mean)}
      tooltipTitle={tooltipTitle}
      {...props}
    >
      {hasValue ? getArrow(mean) : '–'}
    </ResultItemBase>
  )
}

export default WorkloadResultItem
