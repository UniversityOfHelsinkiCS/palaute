import React, { useEffect } from 'react'
import { chunk } from 'lodash-es'
import qs from 'qs'
import { format, isValid } from 'date-fns'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { Alert, Box, Typography, Skeleton } from '@mui/material'
import OngoingIcon from '@mui/icons-material/Schedule'
import UpcomingIcon from '@mui/icons-material/Event'
import EndedIcon from '@mui/icons-material/Done'

import { useTeacherCourseUnits, useTeacherOrganisatioSurveys } from './useTeacherCourseUnits'

import useCourseUnitGridColumns from './useCourseUnitGridColumns'

import { StatusTabs, StatusTab } from '../../../components/common/StatusTabs'
import CourseUnitItem from './CourseUnitGroup/CourseUnitItem'
import CourseUnitAccordion from './CourseUnitGroup/CourseUnitAccordion'
import CourseUnitGroup from './CourseUnitGroup/CourseUnitGroup'
import ExpandableCourseUnitGroup from './CourseUnitGroup/ExpandableCourseUnitGroup'
import CourseUnitGroupGrid from './CourseUnitGroup/CourseUnitGroupGrid'
import CourseUnitGroupTitle from './CourseUnitGroup/CourseUnitGroupTitle'
import CourseUnitGroupGridColumn from './CourseUnitGroup/CourseUnitGroupGridColumn'

import Title from '../../../components/common/Title'
import CourseUnitItemContainer from './CourseUnitGroup/CourseUnitItemContainer'
import { useMyTeachingTabCounts } from './useMyTeachingTabCounts'
import { SemesterSelector } from '../../../components/common/YearSemesterSelector'
import { useYearSemesters } from '../../../util/yearSemesterUtils'
import useURLSearchParams from '../../../hooks/useURLSearchParams'

const CourseUnitGroupSkeleton = () => (
  <>
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 6 }}>
      <Skeleton>
        <Typography variant="h5">Yliopistokurssit</Typography>
      </Skeleton>
      <Skeleton variant="circular" width={20} height={20} sx={{ marginLeft: '1.5rem' }} />
    </Box>

    <Skeleton variant="rectangular" height={250} />
  </>
)

const RenderCourseUnitGroup = ({ groupTitle, courseUnits, status, expandable = false }) => {
  const theme = useTheme()
  const gridColumns = useCourseUnitGridColumns(theme)

  const columnCourseUnits = chunk(courseUnits, Math.ceil(courseUnits.length / gridColumns))

  const CourseUnitComponent = status === 'active' ? CourseUnitItem : CourseUnitAccordion

  const GroupContainer = expandable ? ExpandableCourseUnitGroup : CourseUnitGroup

  return (
    <GroupContainer>
      <CourseUnitGroupTitle title={groupTitle} badgeContent={courseUnits?.length} />
      <CourseUnitGroupGrid>
        {columnCourseUnits.map((courseUnitColumn, i) => (
          <CourseUnitGroupGridColumn key={`course-unit-grid-column-${i + 1}`}>
            {courseUnitColumn.map(courseUnit => (
              <CourseUnitItemContainer key={courseUnit.id}>
                <CourseUnitComponent courseUnit={courseUnit} />
              </CourseUnitItemContainer>
            ))}
          </CourseUnitGroupGridColumn>
        ))}
      </CourseUnitGroupGrid>
    </GroupContainer>
  )
}

const FilterRow = ({ dateRange, setDateRange }) => {
  const [params, setParams] = useURLSearchParams()

  const { semesters, currentSemester } = useYearSemesters(dateRange.start)

  useEffect(() => {
    if (!params.get('startDate') || !params.get('endDate')) {
      params.set('startDate', format(currentSemester.start, 'yyyy-MM-dd'))
      params.set('endDate', format(currentSemester.end, 'yyyy-MM-dd'))
      setParams(params)
      setDateRange({ start: currentSemester.start, end: currentSemester.end })
    }
  }, [currentSemester, params, setParams])

  const handleChangeTimeRange = nextDateRange => {
    setDateRange(nextDateRange)
    if (isValid(nextDateRange.start) && isValid(nextDateRange.end)) {
      params.set('startDate', format(nextDateRange.start, 'yyyy-MM-dd'))
      params.set('endDate', format(nextDateRange.end, 'yyyy-MM-dd'))
      setParams(params)
    }
  }

  return (
    <Box
      sx={{
        position: { md: 'absolute' },
        right: 0,
        top: { md: 80 },
      }}
    >
      <SemesterSelector value={currentSemester} onChange={handleChangeTimeRange} semesters={semesters} sx={{ mx: 2 }} />
    </Box>
  )
}

const MyTeaching = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const [params] = useURLSearchParams()
  const [dateRange, setDateRange] = React.useState(() => {
    const start = new Date(String(params.get('startDate')))
    const end = new Date(String(params.get('endDate')))

    return isValid(start) && isValid(end) ? { start, end } : { start: new Date(), end: new Date() }
  })

  const startDate = format(dateRange.start, 'yyyy-MM-dd')
  const endDate = format(dateRange.end, 'yyyy-MM-dd')

  const { status = 'active' } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })

  const queryParams = {
    status,
    ...(status === 'ended' && { startDate, endDate }),
  }

  const { tabCounts } = useMyTeachingTabCounts()
  const { courseUnits, isLoading } = useTeacherCourseUnits(queryParams)
  const { courseUnits: orgSurveyCourseUnits, isLoading: isOrgSurveysLoading } =
    useTeacherOrganisatioSurveys(queryParams)

  return (
    <Box sx={{ position: 'relative' }}>
      <Title>{t('common:teacherPage')}</Title>
      <Typography id="my-teaching-title" variant="h4" component="h1">
        {t('teacherView:mainHeadingV2')}
      </Typography>

      <StatusTabs aria-labelledby="my-teaching-title" status={status} tabOrder={['ongoing', 'upcoming', 'ended']}>
        <StatusTab
          data-cy="my-teaching-active-tab"
          label={t('teacherView:activeSurveys')}
          status="active"
          icon={<OngoingIcon />}
          iconPosition="start"
        />
        <StatusTab
          data-cy="my-teaching-upcoming-tab"
          label={t('teacherView:upcomingSurveys')}
          status="upcoming"
          icon={<UpcomingIcon />}
          iconPosition="start"
        />
        <StatusTab
          data-cy="my-teaching-ended-tab"
          label={t('teacherView:endedSurveys')}
          status="ended"
          count={tabCounts?.ended}
          badgeColor="error"
          icon={<EndedIcon />}
          iconPosition="start"
        />
      </StatusTabs>

      {isLoading && isOrgSurveysLoading && <CourseUnitGroupSkeleton />}

      {orgSurveyCourseUnits?.length === 0 && courseUnits?.length === 0 && (
        <Alert data-cy="my-teaching-no-courses" severity="info">
          {t('teacherView:noCourses')}
        </Alert>
      )}

      {status === 'ended' && <FilterRow dateRange={dateRange} setDateRange={setDateRange} />}

      {orgSurveyCourseUnits?.length > 0 && (
        <RenderCourseUnitGroup
          groupTitle={t('teacherView:organisationSurveys')}
          courseUnits={orgSurveyCourseUnits}
          status={status}
          expandable
        />
      )}

      {courseUnits?.length > 0 && (
        <RenderCourseUnitGroup groupTitle={t('teacherView:courseSurveys')} courseUnits={courseUnits} status={status} />
      )}
    </Box>
  )
}

export default MyTeaching
