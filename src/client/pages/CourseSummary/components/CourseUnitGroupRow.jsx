import React from 'react'
import { blueGrey } from '@mui/material/colors'
import { useTranslation } from 'react-i18next'
import { Box } from '@mui/material'
import { getLanguageValue } from '../../../util/languageUtils'
import { CourseUnitLabel } from './Labels'
import RowHeader from './RowHeader'
import { FeedbackTargetSummaryRow, SummaryResultElements } from './SummaryRow'
import { SorterRow } from './SorterRow'

const questionFilter = q => q.type === 'LIKERT' || q.secondaryType === 'WORKLOAD'

const CourseUnitGroupAggregateRow = ({ courseUnitGroup, questions }) => {
  const { i18n } = useTranslation()

  const label = (
    <CourseUnitLabel name={getLanguageValue(courseUnitGroup.name, i18n.language)} code={courseUnitGroup.courseCode} />
  )

  return (
    <Box sx={{ display: 'flex', alignItems: 'stretch', gap: '0.2rem' }}>
      <RowHeader label={label} />
      <SummaryResultElements summary={courseUnitGroup.summary} questions={questions} />
    </Box>
  )
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

export const MultiSurveyGroups = ({ courseUnitGroup }) => {
  const { surveyGroups: rawGroups } = courseUnitGroup

  const surveyGroups = rawGroups.map(({ survey, feedbackTargets }) => ({
    survey,
    feedbackTargets,
    questions: (survey.questions ?? []).filter(questionFilter),
  }))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
      {surveyGroups.map(({ survey, feedbackTargets: groupFbts, questions: surveyQuestions }) => (
        <Box
          key={survey.id}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '0.4rem',
            pt: '0.5rem',
            transition: 'padding-top 0.2s ease-out',
          }}
        >
          <SorterRow questions={surveyQuestions} />
          <CourseUnitGroupAggregateRow courseUnitGroup={courseUnitGroup} questions={surveyQuestions} />
          <Box sx={fbtListSx}>
            {groupFbts.map(fbt => (
              <FeedbackTargetSummaryRow key={fbt.id} feedbackTarget={fbt} questions={surveyQuestions} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

const CourseUnitGroupSummaryRow = ({ courseUnitGroup, questions }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '0.4rem',
      pt: '0.5rem',
      transition: 'padding-top 0.2s ease-out',
    }}
  >
    <CourseUnitGroupAggregateRow courseUnitGroup={courseUnitGroup} questions={questions} />
    <Box sx={fbtListSx}>
      {courseUnitGroup.feedbackTargets.map(fbt => (
        <FeedbackTargetSummaryRow key={fbt.id} feedbackTarget={fbt} questions={questions} />
      ))}
    </Box>
  </Box>
)

export default CourseUnitGroupSummaryRow
