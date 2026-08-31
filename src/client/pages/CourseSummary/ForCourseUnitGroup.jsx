import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { AccessibleLoadingBar } from '../../components/common/AccessibleLoadingBar'
import { YearSemesterPeriodSelector } from '../../components/common/YearSemesterPeriodSelector'
import { useCourseUnitGroupSummaries } from './api'
import SurveyGroupSection from './components/CourseUnitGroupRow'
import CourseUnitGroupSummaryTable, { questionFilter } from './components/CourseUnitGroupSummaryTable'
import { QuestionFullLabels } from './components/Labels'
import NoSummaryAlert from './components/NoSummaryAlert'
import SorterRowWithFilters from './components/SorterRow'
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

  const { dateRange, setDateRange, option, setOption, questions: contextQuestions } = useSummaryContext()
  const { courseUnitGroup, isLoading } = useCourseUnitGroupSummaries({
    courseCode: code,
    startDate: dateRange.start,
    endDate: dateRange.end,
    allTime: option === 'all',
  })

  const surveyGroups = courseUnitGroup?.surveyGroups ?? []
  const multipleGroups = surveyGroups.length > 1

  // Each survey group can have its own question set (or fall back to the context's),
  // so the info box needs the union of all of them, deduped by question id.
  const questionsById = new Map()
  surveyGroups.forEach(group => {
    const groupQuestions = group.survey ? (group.survey.questions ?? []).filter(questionFilter) : contextQuestions
    groupQuestions.forEach(q => questionsById.set(q.id, q))
  })
  const questions = [...questionsById.values()]

  return (
    <SummaryScrollContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.3rem' }}>
        {tableView ? (
          <SorterRowWithFilters hideColumns allTime showSortSelector={Boolean(courseUnitGroup)} />
        ) : (
          <Box sx={filterContainerSx}>
            <YearSemesterPeriodSelector
              value={dateRange}
              onChange={setDateRange}
              option={option}
              setOption={setOption}
              allowAll
            />
          </Box>
        )}
        {!isLoading && !courseUnitGroup && (
          <NoSummaryAlert alertText={t('courseSummary:noCourseRealisations', { courseCode: code })} />
        )}
        {tableView && courseUnitGroup && <QuestionFullLabels questions={questions} />}
        {tableView &&
          courseUnitGroup &&
          surveyGroups.map((group, index) => (
            <CourseUnitGroupSummaryTable
              key={group.survey?.id ?? 'single'}
              courseUnitGroup={courseUnitGroup}
              group={group}
              showTimePeriod={multipleGroups}
              validUntil={surveyGroups[index - 1]?.survey?.validFrom ?? null}
              isLoading={isLoading}
            />
          ))}
        {isLoading && <AccessibleLoadingBar />}
        {!isLoading &&
          !tableView &&
          courseUnitGroup &&
          surveyGroups.map((group, index) => (
            <SurveyGroupSection
              key={group.survey?.id ?? 'single'}
              courseUnitGroup={courseUnitGroup}
              group={group}
              showTimePeriod={multipleGroups}
              validUntil={surveyGroups[index - 1]?.survey?.validFrom ?? null}
            />
          ))}
      </Box>
    </SummaryScrollContainer>
  )
}

export default ForCourseUnitGroup
