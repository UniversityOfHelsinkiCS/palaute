import { Box, Typography } from '@mui/material'
import { blueGrey } from '@mui/material/colors'
import { orderBy } from 'lodash-es'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../util/languageUtils'
import { getSummarySortFunction, useSummaryContext } from '../context'
import { questionFilter, resolveGroupSortField } from '../surveyGroupQuestionUtils'
import { CourseUnitLabel } from './Labels'
import RowHeader from './RowHeader'
import { SorterRow } from './SorterRow'
import { FeedbackTargetSummaryRow, SummaryResultElements } from './SummaryRow'

const CourseUnitGroupAggregateRow = ({ courseUnitGroup, summary, questions, timeframe }) => {
  const { i18n } = useTranslation()

  const label = (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CourseUnitLabel name={getLanguageValue(courseUnitGroup.name, i18n.language)} code={courseUnitGroup.courseCode} />
      {timeframe && (
        <Typography variant="caption" color="text.secondary" sx={{ pl: '0.5rem' }}>
          {timeframe}
        </Typography>
      )}
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', alignItems: 'stretch', gap: '0.2rem' }}>
      <RowHeader label={label} />
      <SummaryResultElements summary={summary} questions={questions} />
    </Box>
  )
}

const sectionSx = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '0.4rem',
  pt: '0.5rem',
  transition: 'padding-top 0.2s ease-out',
}

const fbtListSx = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '0.4rem',
  pl: '2rem',
  pb: '0.5rem',
  borderLeft: `solid 3px ${blueGrey[100]}`,
}

const SurveyGroupSection = ({ courseUnitGroup, group, showTimePeriod, validUntil, sortQuestionKey }) => {
  const { questions: contextQuestions, sortBy } = useSummaryContext()
  const questions = group.survey ? (group.survey.questions ?? []).filter(questionFilter) : contextQuestions

  // When sorting by a question, resolve the id it has in this group's survey. A group whose survey
  // does not include the question keeps its default ordering instead of sorting by nothing.
  const sortField = resolveGroupSortField({ sortField: sortBy[0], sortQuestionKey, questions })
  const sortFunction = sortField ? getSummarySortFunction(sortField) : () => undefined

  const sortedFeedbackTargets = orderBy(
    group.feedbackTargets ?? [],
    [fbt => sortFunction(fbt.summary), fbt => fbt.courseRealisation?.startDate],
    [sortBy[1], 'desc']
  )

  let timeframe = null
  if (showTimePeriod) {
    const validFromYear = group.survey?.validFrom ? new Date(group.survey.validFrom).getFullYear() : null
    const validUntilYear = validUntil ? new Date(validUntil).getFullYear() : null

    let startYear = validFromYear
    if (!startYear) {
      const realisationYears = group.feedbackTargets
        .map(fbt => fbt.courseRealisation?.startDate)
        .filter(Boolean)
        .map(d => new Date(d).getFullYear())
      startYear = realisationYears.length ? Math.min(...realisationYears) : null
    }

    if (startYear && !validUntilYear) timeframe = `${startYear}–`
    else if (startYear && validUntilYear) timeframe = `${startYear}–${validUntilYear}`
  }

  return (
    <Box sx={sectionSx}>
      <SorterRow questions={questions} />
      <CourseUnitGroupAggregateRow
        courseUnitGroup={courseUnitGroup}
        summary={group.summary}
        questions={questions}
        timeframe={timeframe}
      />
      <Box sx={fbtListSx}>
        {sortedFeedbackTargets.map(fbt => (
          <FeedbackTargetSummaryRow key={fbt.id} feedbackTarget={fbt} questions={questions} />
        ))}
      </Box>
    </Box>
  )
}

export default SurveyGroupSection
