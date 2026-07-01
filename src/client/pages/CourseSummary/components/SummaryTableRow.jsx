import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Tooltip, TableHead, TableCell, TableRow, Link as MuiLink } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { format, isValid } from 'date-fns'
import { getLanguageValue } from '../../../util/languageUtils'
import { getSafeCourseCode } from '../../../util/courseIdentifiers'
import { getArrow } from '../../../components/SummaryResultItem/WorkloadResultItem'
import { getMeanOption } from '../../FeedbackTarget/tabs/Results/QuestionResults/AverageResult'

// TODO: How to handle cases where questions are from different university level surveys?
// What kind of cases? Info box or separate tables?

const styles = {
  cell: {
    whiteSpace: 'nowrap',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '3.5rem',
    borderRadius: 2,
    color: 'black',
  },
  headerCell: {
    verticalAlign: 'bottom',
    borderBottom: '0.4rem solid #5F93CE',
  },
}

const getCourseUnitSummaryUrl = ({ courseCode, startDate, endDate }) => {
  const safeCourseCode = getSafeCourseCode({ courseCode })

  const courseLinkURL = new URL(`/course-summary/course-unit/${safeCourseCode}`, 'http://dummy')
  if (isValid(startDate) && isValid(endDate)) {
    courseLinkURL.searchParams.append('startDate', format(startDate, 'yyyy-MM-dd'))
    courseLinkURL.searchParams.append('endDate', format(endDate, 'yyyy-MM-dd'))
  }

  const [searchParams] = useSearchParams()
  const optionParam = searchParams.get('option')
  if (optionParam) {
    courseLinkURL.searchParams.append('option', optionParam)
  }

  const link = `${courseLinkURL.pathname}${courseLinkURL.search}`

  return link
}

const getBackgroundColor = ({ value, factor }) => {
  const backgroundColors = {
    1: '#d355b3',
    2: '#e8a6d7',
    3: '#a8def0',
    4: '#a6e8b6',
    5: '#289a44',
  }

  for (let i = 1; i < 5; i++) {
    if (value < i * factor + 1) return backgroundColors[i]
  }

  return backgroundColors[5]
}

export const SummaryTableHeader = ({ questions }) => {
  const { t, i18n } = useTranslation()

  return (
    <TableHead>
      <TableRow>
        <TableCell sx={styles.headerCell}>{t('courseSummary:summaryTarget')}</TableCell>
        {questions.map(q => (
          <TableCell key={q.id} sx={styles.headerCell}>
            {getLanguageValue(q.data.label, i18n.language)}
          </TableCell>
        ))}
        <TableCell sx={styles.headerCell}>{t('courseSummary:feedbackCount')}</TableCell>
        <TableCell sx={styles.headerCell}>{t('courseSummary:feedbackPercentage')}</TableCell>
        <TableCell sx={styles.headerCell}>{t('courseSummary:feedbackResponsePercentage')}</TableCell>
        <TableCell sx={styles.headerCell}>{t('courseSummary:censoredCount')}</TableCell>
      </TableRow>
    </TableHead>
  )
}

export const SummaryTableRow = ({ target, targetCode, questions, summary, depth = 1 }) => {
  const { t, i18n } = useTranslation()
  const data = summary?.data
  const percent = data ? ((summary.data.feedbackCount / summary.data.studentCount) * 100).toFixed() : '-'
  const feedbackResponsePercentage = data ? (summary.data.feedbackResponsePercentage * 100).toFixed() : '-'

  const targetUrl = getCourseUnitSummaryUrl({ courseCode: targetCode })

  return (
    <TableRow
      sx={{
        '& > th:first-of-type': {
          boxShadow: depth === 1 ? `inset ${depth * 0.4}rem 0 0 #5F93CE` : `inset ${depth * 0.6}rem 0 0 #5F93CE`,
          pl: depth === 1 ? `${depth * 0.4 + 1}rem` : `${depth * 0.6 + 1}rem`,
        },
      }}
    >
      <TableCell component="th" scope="row">
        {targetCode && targetUrl ? (
          <MuiLink component={Link} to={targetUrl}>
            {target}
          </MuiLink>
        ) : (
          <Typography>{target}</Typography>
        )}
      </TableCell>
      {questions.map(q => {
        const isWorkloadQuestion = q?.secondaryType === 'WORKLOAD'
        const mean = data?.result?.[q.id]?.mean?.toFixed(2) || 0
        const normalizedMean = isWorkloadQuestion ? 5.0 - Math.abs((mean - 3) * 2.0) : mean

        const meanText = isWorkloadQuestion
          ? getLanguageValue(getMeanOption(mean, q)?.label, i18n.language)
          : normalizedMean
        const screenReaderText =
          normalizedMean > 0 ? `${t('feedbackSummary:average')}: ${meanText}` : t('courseSummary:noResults')

        return (
          <TableCell key={q.id}>
            <Box
              sx={{
                backgroundColor: mean ? getBackgroundColor({ value: normalizedMean, factor: 0.8 }) : 'transparent',
                width: '3.5rem',
                ...styles.cell,
              }}
              aria-hidden
            >
              {isWorkloadQuestion &&
                (mean > 0 ? <Tooltip title={screenReaderText}>{getArrow(mean)}</Tooltip> : <Typography>–</Typography>)}
              {!isWorkloadQuestion && <Typography>{mean > 0 ? mean : '–'}</Typography>}
            </Box>
            <Box component="span" sx={{ ...visuallyHidden, width: '0px', height: '0px' }}>
              {screenReaderText}
            </Box>
          </TableCell>
        )
      })}
      <TableCell>
        <Box
          sx={{
            backgroundColor: percent ? getBackgroundColor({ value: percent, factor: 10 }) : 'transparent',
            width: '8rem',
            ...styles.cell,
          }}
        >
          <Typography>{data ? `${data.feedbackCount} / ${data.studentCount}` : '–'}</Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box
          sx={{
            backgroundColor: percent ? getBackgroundColor({ value: percent, factor: 10 }) : 'transparent',
            width: '5rem',
            ...styles.cell,
          }}
        >
          <Typography>{`${percent} %`}</Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box
          sx={{
            backgroundColor: feedbackResponsePercentage
              ? getBackgroundColor({ value: feedbackResponsePercentage, factor: 20 })
              : 'transparent',
            width: '5rem',
            ...styles.cell,
          }}
        >
          <Typography>{`${feedbackResponsePercentage} %`}</Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box
          sx={{
            backgroundColor: data?.hiddenCount ? '#d355b3' : '#a8def0',
            width: '3.5rem',
            ...styles.cell,
          }}
        >
          <Typography>{data?.hiddenCount || '0'}</Typography>
        </Box>
      </TableCell>
    </TableRow>
  )
}
