import { Alert, Box, LinearProgress } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { YearSemesterPeriodSelector } from '../../components/common/YearSemesterPeriodSelector'
import { useCourseUnitGroupSummaries } from './api'
import SurveyGroupSection from './components/CourseUnitGroupRow'
import CourseUnitGroupSummaryTable from './components/CourseUnitGroupSummaryTable'
import SummaryScrollContainer from './components/SummaryScrollContainer'
import { useSummaryContext } from './context'

const filterContainerSx = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: '1rem',
  rowGap: '0.5rem',
}

const ForCourseUnitGroup = ({ tableView = false }) => {
  const { t } = useTranslation()
  const { code } = useParams()

  const { dateRange, setDateRange, option, setOption } = useSummaryContext()
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
        <Box sx={filterContainerSx}>
          <YearSemesterPeriodSelector
            value={dateRange}
            onChange={setDateRange}
            option={option}
            setOption={setOption}
            allowAll
          />
        </Box>
        {tableView &&
          courseUnitGroup &&
          surveyGroups.map((group, index) => (
            <CourseUnitGroupSummaryTable
              key={group.survey?.id ?? 'single'}
              courseUnitGroup={courseUnitGroup}
              group={group}
              showTimePeriod={multipleGroups}
              validUntil={surveyGroups[index - 1]?.survey?.validFrom ?? null}
            />
          ))}
        {isLoading && !tableView && <LinearProgress />}
        {!isLoading &&
          !tableView &&
          (courseUnitGroup ? (
            surveyGroups.map((group, index) => (
              <SurveyGroupSection
                key={group.survey?.id ?? 'single'}
                courseUnitGroup={courseUnitGroup}
                group={group}
                showTimePeriod={multipleGroups}
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
