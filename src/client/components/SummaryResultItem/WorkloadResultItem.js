import React from 'react'
import { Box } from '@mui/material'
import ArrowIcon from '@mui/icons-material/TrendingFlat'
import { useTranslation } from 'react-i18next'
import { sumBy, isEmpty, round, orderBy } from 'lodash'
import { getLanguageValue } from '../../util/languageUtils'
import ResultItemBase from './ResultItemBase'
import { WORKLOAD_QUESTION_ID_ORDER } from '../../util/common'

const normalizeMean = mean => {
  const diff = mean - 3

  return diff / 2
}

const getArrow = mean => {
  const normalizedMean = normalizeMean(mean)

  const angle = normalizedMean * 90

  return <ArrowIcon style={{ transform: `rotate(${angle}deg)` }} />
}

const getTooltipData = (distribution, question) => {
  const labelByQuestionId = (question.data?.options ?? []).reduce(
    (acc, curr) => ({
      ...acc,
      [curr.id]: curr.label,
    }),
    {}
  )

  // Order by WORKLOAD_QUESTION_ID_ORDER, from "too little" to "too much"
  const entries = orderBy(Object.entries(distribution), ([id]) => -WORKLOAD_QUESTION_ID_ORDER.indexOf(id), ['asc'])
  const totalCount = sumBy(entries, ([, count]) => count)

  return entries.map(([id, count]) => ({
    id,
    percentage: count / totalCount,
    label: labelByQuestionId[id],
  }))
}

const WorkloadResultItem = ({ mean, distribution, previous, question, ...props }) => {
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
            {getLanguageValue(label, i18n.language) ?? '-'}: {round(percentage * 100, 0)}%
          </div>
        ))
      ) : (
        <div>{t('courseSummary:noResults')}</div>
      )}
    </>
  )

  return (
    <ResultItemBase mean={5.0 - Math.abs((mean - 3) * 2.0)} tooltipTitle={tooltipTitle} {...props}>
      {hasValue ? getArrow(mean) : '–'}
    </ResultItemBase>
  )
}

export default WorkloadResultItem
