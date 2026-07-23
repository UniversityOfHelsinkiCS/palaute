import { Box, Typography, Tooltip, TableHead, TableCell, TableRow, ButtonBase } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { format, isValid } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { useSearchParams, Link } from 'react-router-dom'

import { getArrow } from '../../../components/SummaryResultItem/WorkloadResultItem'
import { focusIndicatorStyle } from '../../../util/accessibility'
import { getSafeCourseCode } from '../../../util/courseIdentifiers'
import { getLanguageValue } from '../../../util/languageUtils'
import { getMeanOption } from '../../FeedbackTarget/tabs/Results/QuestionResults/AverageResult'

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
    p: 1,
    backgroundColor: 'white',
  },
  linkButton: {
    color: 'primary.main',
    textDecoration: 'underline',
    p: 0.5,
    borderRadius: 1,
    '&:hover': {
      color: 'primary.dark',
    },
    ...focusIndicatorStyle(),
  },
  tooltipArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '2.5rem',
    height: '2.5rem',
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

const SummaryTableHeaderCell = ({ children, sx = {}, ...props }) => (
  <TableCell sx={{ ...styles.headerCell, ...sx }} {...props}>
    {children}
  </TableCell>
)

const SummaryTableCell = ({ children, sx = {}, ...props }) => (
  <TableCell sx={{ backgroundColor: 'white', verticalAlign: 'top', ...sx }} {...props}>
    {children}
  </TableCell>
)

const SummaryTableCellContent = ({ width, backgroundColor, children, ...props }) => (
  <Box sx={{ width, backgroundColor, ...styles.cell }} {...props}>
    {children}
  </Box>
)

export const SummaryTableHeader = ({ questions }) => {
  const { t, i18n } = useTranslation()

  return (
    <TableHead>
      <TableRow>
        <SummaryTableHeaderCell sx={{ position: 'sticky', left: 0, zIndex: 3 }}>
          {t('courseSummary:summaryTarget')}
        </SummaryTableHeaderCell>
        {questions.map(q => (
          <SummaryTableHeaderCell key={q.id} align="left">
            {getLanguageValue(q.data.label, i18n.language)}
          </SummaryTableHeaderCell>
        ))}
        <SummaryTableHeaderCell>{`${t('courseSummary:feedbackCount')} / ${t('courseSummary:studentCount')}`}</SummaryTableHeaderCell>
        <SummaryTableHeaderCell>{t('courseSummary:feedbackPercentage')}</SummaryTableHeaderCell>
        <SummaryTableHeaderCell>{t('courseSummary:feedbackResponsePercentage')}</SummaryTableHeaderCell>
        <SummaryTableHeaderCell>{t('courseSummary:censoredCount')}</SummaryTableHeaderCell>
      </TableRow>
    </TableHead>
  )
}

export const SummaryTableRow = ({ target, targetCode, questions, summary, depth = 1 }) => {
  const { t, i18n } = useTranslation()
  const data = summary?.data
  const percent = data ? ((summary.data.feedbackCount / summary.data.studentCount) * 100).toFixed() : null
  const feedbackResponsePercentage = data ? (summary.data.feedbackResponsePercentage * 100).toFixed() : null
  const hiddenCount = data?.hiddenCount || 0

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
      <SummaryTableCell component="th" scope="row" sx={{ position: 'sticky', left: 0, zIndex: 2 }}>
        {targetCode && targetUrl ? (
          <Tooltip title={t('courseSummary:openCuSummary')} placement="bottom" arrow describeChild>
            <ButtonBase component={Link} to={targetUrl} sx={styles.linkButton}>
              <Typography variant="body2">{target}</Typography>
            </ButtonBase>
          </Tooltip>
        ) : (
          <Typography>{target}</Typography>
        )}
      </SummaryTableCell>
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
          <SummaryTableCell key={q.id} align="right">
            <SummaryTableCellContent
              width="3.5rem"
              backgroundColor={mean ? getBackgroundColor({ value: normalizedMean, factor: 0.8 }) : 'transparent'}
              aria-hidden
            >
              {isWorkloadQuestion &&
                (mean > 0 ? (
                  <Tooltip title={screenReaderText}>
                    <Box sx={styles.tooltipArea}>{getArrow(mean)}</Box>
                  </Tooltip>
                ) : (
                  <Typography>–</Typography>
                ))}
              {!isWorkloadQuestion && <Typography>{mean > 0 ? mean : '–'}</Typography>}
            </SummaryTableCellContent>
            <Box component="span" sx={{ ...visuallyHidden, width: '0px', height: '0px' }}>
              {screenReaderText}
            </Box>
          </SummaryTableCell>
        )
      })}
      <SummaryTableCell>
        <SummaryTableCellContent
          width="8rem"
          backgroundColor={percent ? getBackgroundColor({ value: percent, factor: 10 }) : 'transparent'}
        >
          <Typography>{data ? `${data.feedbackCount} / ${data.studentCount}` : '–'}</Typography>
        </SummaryTableCellContent>
      </SummaryTableCell>
      <SummaryTableCell>
        <SummaryTableCellContent
          width="5rem"
          backgroundColor={percent !== null ? getBackgroundColor({ value: percent, factor: 10 }) : 'transparent'}
        >
          <Typography>{percent !== null ? `${percent} %` : '–'}</Typography>
        </SummaryTableCellContent>
      </SummaryTableCell>
      <SummaryTableCell>
        <SummaryTableCellContent
          width="5rem"
          backgroundColor={
            feedbackResponsePercentage !== null
              ? getBackgroundColor({ value: feedbackResponsePercentage, factor: 20 })
              : 'transparent'
          }
        >
          <Typography>{feedbackResponsePercentage !== null ? `${feedbackResponsePercentage} %` : '–'}</Typography>
        </SummaryTableCellContent>
      </SummaryTableCell>
      <SummaryTableCell>
        <SummaryTableCellContent width="3.5rem" backgroundColor={hiddenCount > 0 ? '#e8a6d7' : '#a8def0'}>
          <Typography>{hiddenCount}</Typography>
        </SummaryTableCellContent>
      </SummaryTableCell>
    </TableRow>
  )
}
