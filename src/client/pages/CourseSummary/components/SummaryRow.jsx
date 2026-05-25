import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { orderBy } from 'lodash-es'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Tooltip, Skeleton, IconButton } from '@mui/material'
import { InfoOutlined } from '@mui/icons-material'
import { format, isValid } from 'date-fns'
import { useSummaries } from '../api'
import { getLanguageValue } from '../../../util/languageUtils'
import SummaryResultItem from '../../../components/SummaryResultItem/SummaryResultItem'
import { FeedbackTargetLabel, CourseUnitLabel } from './Labels'
import PercentageCell from './PercentageCell'
import { useSummaryContext } from '../context'
import RowHeader from './RowHeader'
import CensoredCount from './CensoredCount'
import FeedbackResponseIndicator from './FeedbackResponseIndicator'
import { getSafeCourseCode } from '../../../util/courseIdentifiers'
import { WORKLOAD_QUESTION_ID } from '../../../util/common'

const hasFeedbackButNoCurrentQuestionData = (summary, questions) => {
  if (!summary?.data?.feedbackCount) return false
  const likertQuestions = questions.filter(q => q.id !== WORKLOAD_QUESTION_ID)
  return likertQuestions.length > 0 && likertQuestions.every(q => summary.data.result?.[q.id] === undefined)
}

const PreviousSurveyDataInfo = () => {
  const { t } = useTranslation()
  return (
    <Tooltip title={t('courseSummary:previousSurveyDataInfo')} disableInteractive>
      <IconButton size="small" sx={{ flexShrink: 0, ml: '0.25rem', color: 'info.main' }}>
        <InfoOutlined fontSize="medium" />
      </IconButton>
    </Tooltip>
  )
}

const styles = {
  resultCell: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: '3.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCell: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    flexShrink: 0,
    width: '7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentCell: {
    whiteSpace: 'nowrap',
    textAlign: 'right',
    width: '4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexShrink: 0,
  },
}

export const Loader = () => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="stretch"
    gap="0.4rem"
    sx={{ transition: 'padding-top 0.2s ease-out' }}
  >
    <Box display="flex" alignItems="stretch" gap="0.2rem">
      <RowHeader
        label={
          <Skeleton>
            <Typography>Ladataan</Typography>
          </Skeleton>
        }
      />
    </Box>
  </Box>
)

export const SummaryResultElements = ({ questions, summary, feedbackResponseIndicator }) => {
  const { t } = useTranslation()
  const data = summary?.data
  const percent = data ? ((summary.data.feedbackCount / summary.data.studentCount) * 100).toFixed() : '-'
  const feedbackResponsePercentage = data ? (summary.data.feedbackResponsePercentage * 100).toFixed() : '-'

  return (
    <>
      {questions.map(q => (
        <SummaryResultItem
          key={q.id}
          question={q}
          mean={data?.result?.[q.id]?.mean}
          distribution={data ? data.result[q.id]?.distribution : {}}
          sx={styles.resultCell}
          component="div"
        />
      ))}
      <Tooltip title={t('common:feedbacksGivenRatio')} disableInteractive>
        <Typography variant="body2" sx={styles.countCell}>
          {data ? `${data.feedbackCount} / ${data.studentCount}` : '-'}
        </Typography>
      </Tooltip>
      <PercentageCell
        label={`${percent}%`}
        percent={percent}
        sx={styles.percentCell}
        tooltip={`${t('courseSummary:feedbackPercentage')}: ${percent}%`}
      />
      {feedbackResponseIndicator ? (
        <Box sx={styles.percentCell}>{feedbackResponseIndicator}</Box>
      ) : (
        <PercentageCell
          label={`${feedbackResponsePercentage}%`}
          percent={feedbackResponsePercentage}
          sx={styles.percentCell}
          tooltip={`${t('courseSummary:feedbackResponsePercentage')}: ${feedbackResponsePercentage}%`}
        />
      )}
      <Box sx={styles.countCell}>{Boolean(data?.hiddenCount) && <CensoredCount count={data.hiddenCount} />}</Box>
    </>
  )
}

export const CourseUnitSummaryRow = ({ courseUnit, questions, startDate, endDate }) => {
  const { i18n, t } = useTranslation()

  const labelExtras = []
  if (courseUnit.partial) labelExtras.push(t('common:partiallyResponsible'))
  if (courseUnit.separateOrganisation)
    labelExtras.push(getLanguageValue(courseUnit.separateOrganisation.name, i18n.language))

  const isIncompleteSurveyData = hasFeedbackButNoCurrentQuestionData(courseUnit.summary, questions)

  const label = (
    <Box display="flex" alignItems="center" minWidth={0}>
      <CourseUnitLabel
        name={getLanguageValue(courseUnit.name, i18n.language)}
        code={courseUnit.courseCode}
        extras={labelExtras}
      />
      {isIncompleteSurveyData && <PreviousSurveyDataInfo />}
    </Box>
  )

  const safeCourseCode = getSafeCourseCode({ courseCode: courseUnit?.courseCode })

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
  const { summary } = courseUnit

  return (
    <Box display="flex" alignItems="stretch" gap="0.2rem">
      <RowHeader label={label} link={link} />
      <SummaryResultElements summary={summary} questions={questions} />
    </Box>
  )
}

export const FeedbackTargetSummaryRow = ({ feedbackTarget, questions }) => {
  const { i18n } = useTranslation()
  const { summary } = feedbackTarget

  const notGivenStatus = Date.parse(feedbackTarget.closesAt) > Date.now() ? 'OPEN' : 'NONE'
  const responseStatus =
    summary?.data?.feedbackResponsePercentage === 1 || feedbackTarget.feedbackResponse?.length
      ? 'GIVEN'
      : notGivenStatus

  const feedbackResponseIndicator = (
    <FeedbackResponseIndicator status={responseStatus} currentFeedbackTargetId={feedbackTarget.id} />
  )

  const isIncompleteSurveyData = hasFeedbackButNoCurrentQuestionData(summary, questions)

  const label = (
    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, width: '100%' }}>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <FeedbackTargetLabel feedbackTarget={feedbackTarget} language={i18n.language} />
      </Box>
      {isIncompleteSurveyData && <PreviousSurveyDataInfo />}
    </Box>
  )

  return (
    <Box display="flex" alignItems="stretch" gap="0.2rem">
      <RowHeader label={label} />
      <SummaryResultElements
        summary={summary}
        questions={questions}
        feedbackResponseIndicator={feedbackResponseIndicator}
      />
    </Box>
  )
}

export const CourseUnitsList = ({ organisationId, initialCourseUnits, questions, startDate, endDate, tagId }) => {
  const { sortFunction, sortBy } = useSummaryContext()
  const { organisation, isLoading } = useSummaries({
    entityId: organisationId,
    include: 'courseUnits',
    enabled: !initialCourseUnits?.length,
    tagId,
  })

  const childCourseUnits = initialCourseUnits ?? organisation?.courseUnits

  const orderedCourseUnits = React.useMemo(
    () =>
      childCourseUnits?.length > 0
        ? orderBy(childCourseUnits, [cu => sortFunction(cu.summary), cu => cu.code], [sortBy[1], 'asc'])
        : [],
    [organisation, sortBy[0], sortBy[1]]
  )

  if (isLoading) {
    return <Loader />
  }

  return orderedCourseUnits?.map(cu => (
    <CourseUnitSummaryRow key={cu.id} courseUnit={cu} questions={questions} startDate={startDate} endDate={endDate} />
  ))
}
