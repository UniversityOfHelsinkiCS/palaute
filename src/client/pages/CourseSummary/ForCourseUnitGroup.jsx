import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Box, LinearProgress } from '@mui/material'
import { useParams } from 'react-router'
import { useCourseUnitGroupSummaries } from './api'
import SummaryScrollContainer from './components/SummaryScrollContainer'
import SorterRowWithFilters from './components/SorterRow'
import { useSummaryContext } from './context'
import SurveyGroupSection from './components/CourseUnitGroupRow'

const ForCourseUnitGroup = () => {
  const { t } = useTranslation()
  const { code } = useParams()

  const { dateRange, option } = useSummaryContext()
  const { courseUnitGroup, isLoading } = useCourseUnitGroupSummaries({
    courseCode: code,
    startDate: dateRange.start,
    endDate: dateRange.end,
    allTime: option === 'all',
  })

  const surveyGroups = courseUnitGroup?.surveyGroups ?? []
  const multipleGroups = surveyGroups.length > 1

  return (
    <SummaryScrollContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.3rem' }}>
        <SorterRowWithFilters allTime hideColumns={multipleGroups} />
        {isLoading && <LinearProgress />}
        {!isLoading &&
          (courseUnitGroup ? (
            surveyGroups.map((group, index) => (
              <SurveyGroupSection
                key={group.survey?.id ?? 'single'}
                courseUnitGroup={courseUnitGroup}
                group={group}
                showHeader={multipleGroups}
                validUntil={surveyGroups[index - 1]?.survey?.validFrom ?? null}
              />
            ))
          ) : (
            <Alert severity="info">{t('courseSummary:noCourseRealisations', { courseCode: code })}</Alert>
          ))}
      </Box>
    </SummaryScrollContainer>
  )
}

export default ForCourseUnitGroup
