/* eslint-disable no-nested-ternary */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Box, LinearProgress } from '@mui/material'
import { useParams } from 'react-router'
import { useCourseUnitGroupSummaries } from './api'
import SummaryScrollContainer from './components/SummaryScrollContainer'
import SorterRowWithFilters from './components/SorterRow'
import { useSummaryContext } from './context'
import CourseUnitGroupSummaryRow from './components/CourseUnitGroupRow'

const ForCourseUnitGroup = () => {
  const { t } = useTranslation()
  const { code } = useParams()

  // There are course codes that include slash character (/), which is problematic in req parameter
  // Slash is replaced with tilde (~) here and replaced back before querying database
  // Tilde should not be used in any course codes
  const safeCourseCode = code.replace('/', '~')

  const { dateRange, questions, option } = useSummaryContext()
  const { courseUnitGroup, isLoading } = useCourseUnitGroupSummaries({
    courseCode: safeCourseCode,
    startDate: dateRange.start,
    endDate: dateRange.end,
    allTime: option === 'all',
  })

  return (
    <SummaryScrollContainer>
      <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
        <SorterRowWithFilters allTime />
        {isLoading ? (
          <LinearProgress />
        ) : courseUnitGroup ? (
          <CourseUnitGroupSummaryRow courseUnitGroup={courseUnitGroup} questions={questions} />
        ) : (
          <Alert severity="info">{t('courseSummary:noCourseRealisations')}</Alert>
        )}
      </Box>
    </SummaryScrollContainer>
  )
}

export default ForCourseUnitGroup
