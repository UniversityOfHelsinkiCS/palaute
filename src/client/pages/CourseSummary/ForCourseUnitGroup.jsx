import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { AccessibleLoadingBar } from '../../components/common/AccessibleLoadingBar'
import { YearSemesterPeriodSelector } from '../../components/common/YearSemesterPeriodSelector'
import { useCourseUnitGroupSummaries } from './api'
import SurveyGroupSection from './components/CourseUnitGroupRow'
import CourseUnitGroupSummaryTable from './components/CourseUnitGroupSummaryTable'
import { QuestionFullLabels } from './components/Labels'
import NoSummaryAlert from './components/NoSummaryAlert'
import SorterRowWithFilters from './components/SorterRow'
import SummaryScrollContainer from './components/SummaryScrollContainer'
import { useSummaryContext } from './context'
import { getSortQuestionKey, getUnionOfGroupQuestions } from './surveyGroupQuestionUtils'

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

  const { dateRange, setDateRange, option, setOption, questions: contextQuestions, sortBy } = useSummaryContext()
  const { courseUnitGroup, isLoading } = useCourseUnitGroupSummaries({
    courseCode: code,
    startDate: dateRange.start,
    endDate: dateRange.end,
    allTime: option === 'all',
  })

  const surveyGroups = courseUnitGroup?.surveyGroups ?? []
  const multipleGroups = surveyGroups.length > 1

  const questions = getUnionOfGroupQuestions(surveyGroups, contextQuestions)

  // The sort selector stores a single question id, which is only meaningful in the survey it came
  // from. Pass the survey-independent key along so each group can resolve its own question.
  const sortQuestionKey = getSortQuestionKey({ sortField: sortBy[0], surveyGroups, contextQuestions })

  return (
    <SummaryScrollContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.3rem' }}>
        {tableView ? (
          <SorterRowWithFilters hideColumns allTime questions={questions} showSortSelector={Boolean(courseUnitGroup)} />
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
              sortQuestionKey={sortQuestionKey}
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
              sortQuestionKey={sortQuestionKey}
            />
          ))}
      </Box>
    </SummaryScrollContainer>
  )
}

export default ForCourseUnitGroup
