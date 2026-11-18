import { Box, Typography } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { countBy, round, sum } from 'lodash-es'
import { useTranslation } from 'react-i18next'

import { getArrow } from '../../../../../components/SummaryResultItem/WorkloadResultItem'
import { getLanguageValue } from '../../../../../util/languageUtils'
import { getColor, getWorkloadColor } from '../../../../../util/resultColors'
import { mergeSx } from '../../../../../util/sx'

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
  outlined: {
    p: '2px',
    borderRadius: 0,
    printColorAdjust: 'exact',
  },
  outlinedContent: {
    display: 'flex',
    alignSelf: 'stretch',
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  underlined: {
    width: 'auto',
    height: 'auto',
    borderRadius: 0,
    borderBottom: '3px solid',
    printColorAdjust: 'exact',
  },
  underlinedContent: {
    lineHeight: 1.5,
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

const getWeightedMean = counts => {
  const total = sum(counts)
  if (total === 0) return 0

  return round(counts.reduce((acc, count, index) => acc + (index + 1) * count, 0) / total, 2)
}

const getLikertMean = distribution => getWeightedMean([1, 2, 3, 4, 5].map(value => distribution[value] ?? 0))

const getSingleChoiceMean = (distribution, question) =>
  getWeightedMean(question.data.options.map(option => distribution[option.id] ?? 0))

const getMeanOfDistribution = (question, distribution) => {
  switch (question.type) {
    case 'LIKERT':
      return getLikertMean(distribution)
    case 'SINGLE_CHOICE':
      return getSingleChoiceMean(distribution, question)
    default:
      return 0
  }
}

export const getMean = question => getMeanOfDistribution(question, getDistribution(question.feedbacks))

export const getMeanOption = (mean, question) => {
  if (!question?.data?.options?.length) return null

  let index = Math.round(mean) - 1
  index = Math.max(0, Math.min(index, question.data.options.length - 1))

  return question.data.options[index]
}

const AverageResult = ({ question, variant = 'filled', labelled = true, sx = {} }) => {
  const { t, i18n } = useTranslation()
  const isWorkloadQuestion = question.secondaryType === 'WORKLOAD'

  const mean = getMean(question)
  const fixedMean = mean?.toFixed(2) || 0

  const meanText = isWorkloadQuestion
    ? getLanguageValue(getMeanOption(mean, question)?.label, i18n.language)
    : fixedMean
  const color = isWorkloadQuestion ? getWorkloadColor(mean) : getColor(mean)
  const value = fixedMean > 0 ? meanText : t('courseSummary:noResults')
  const screenReaderText = labelled ? `${t('feedbackSummary:average')}: ${value}` : value

  return (
    <>
      <Box
        sx={mergeSx(
          {
            ...styles.resultItem,
            ...(variant === 'underlined' ? { ...styles.underlined, borderColor: color } : { backgroundColor: color }),
            ...(variant === 'outlined' && styles.outlined),
          },
          sx
        )}
        aria-hidden="true"
      >
        {isWorkloadQuestion && variant === 'filled' && (fixedMean > 0 ? getArrow(mean) : '–')}
        {isWorkloadQuestion && variant !== 'filled' && (
          <Box sx={{ ...styles.content, ...styles[`${variant}Content`] }}>{fixedMean > 0 ? getArrow(mean) : '–'}</Box>
        )}
        {!isWorkloadQuestion && (
          <Box sx={{ ...styles.content, ...styles[`${variant}Content`] }}>
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
