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

import { StatusTabs, StatusTab } from '../../components/common/StatusTabs'
import CourseUnitItem from './CourseUnitGroup/CourseUnitItem'
import CourseUnitAccordion from './CourseUnitGroup/CourseUnitAccordion'
import CourseUnitGroup from './CourseUnitGroup/CourseUnitGroup'
import CourseUnitGroupGrid from './CourseUnitGroup/CourseUnitGroupGrid'
import CourseUnitGroupTitle from './CourseUnitGroup/CourseUnitGroupTitle'
import CourseUnitGroupGridColumn from './CourseUnitGroup/CourseUnitGroupGridColumn'

import Title from '../../components/common/Title'
import CourseUnitItemContainer from './CourseUnitGroup/CourseUnitItemContainer'
import { useMyTeachingTabCounts } from './useMyTeachingTabCounts'
import { AcademicYearSelector } from '../../components/common/YearSemesterSelector'
import { getStudyYearRange, useYearSemesters } from '../../util/yearSemesterUtils'
import useURLSearchParams from '../../hooks/useURLSearchParams'

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

const RenderCourseUnitGroup = ({ groupTitle, courseUnits, status }) => {
  const theme = useTheme()
  const gridColumns = useCourseUnitGridColumns(theme)

  const columnCourseUnits = chunk(courseUnits, Math.ceil(courseUnits.length / gridColumns))

  const CourseUnitComponent = status === 'active' ? CourseUnitItem : CourseUnitAccordion

  return (
    <CourseUnitGroup>
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
    </CourseUnitGroup>
  )
}

const FilterRow = ({ dateRange, setDateRange }) => {
  const { t } = useTranslation()
  const [params, setParams] = useURLSearchParams()

  const { year } = useYearSemesters(dateRange.start)
  const range = getStudyYearRange(new Date(`${year + 1}-01-01`))

  useEffect(() => {
    if (!params.get('startDate') || !params.get('endDate')) {
      params.set('startDate', format(new Date(range.start), 'yyyy-MM-dd'))
      params.set('endDate', format(new Date(range.end), 'yyyy-MM-dd'))
      setParams(params)
      setDateRange({ start: range.start, end: range.end })
    }
  }, [params, setParams])

  const handleChangeTimeRange = nextYear => {
    const newRange = getStudyYearRange(new Date(`${nextYear + 1}-01-01`))

    setDateRange(newRange)
    if (isValid(newRange.start) && isValid(newRange.end)) {
      params.set('startDate', format(new Date(newRange.start), 'yyyy-MM-dd'))
      params.set('endDate', format(new Date(newRange.end), 'yyyy-MM-dd'))
      setParams(params)
    }
  }

  return (
    <Box
      sx={{
        position: { md: 'absolute' },
        right: 0,
        top: { md: 80 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography component="p" id="my-teaching-academic-year-label" variant="body2">
        {t('teacherView:academicYearSelectLabel')}
      </Typography>
      <AcademicYearSelector
        value={year}
        onChange={handleChangeTimeRange}
        labelledBy="my-teaching-academic-year-label"
      />
    </Box>
  )
}

const MyTeaching = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const ongoingAcademicYearRange = getStudyYearRange(new Date())

  const [params] = useURLSearchParams()
  const [dateRange, setDateRange] = React.useState(() => {
    const paramsStart = params.get('startDate')
    const paramsEnd = params.get('endDate')

    const start = paramsStart ? new Date(String(params.get('startDate'))) : ongoingAcademicYearRange.start
    const end = paramsEnd ? new Date(String(params.get('endDate'))) : ongoingAcademicYearRange.end

    return isValid(start) && isValid(end) ? { start, end } : { start: new Date(), end: new Date() }
  })

  const startDate = format(new Date(dateRange.start), 'yyyy-MM-dd')
  const endDate = format(new Date(dateRange.end), 'yyyy-MM-dd')

  const { status = 'active' } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })

  const queryParams = {
    status,
    ...(status === 'ended' && { startDate, endDate }),
  }

  const tabCountsQueryParams = {
    startDate,
    endDate,
  }

  const { tabCounts } = useMyTeachingTabCounts(tabCountsQueryParams)
  const { courseUnits, isLoading } = useTeacherCourseUnits(queryParams)
  const { courseUnits: orgSurveyCourseUnits, isLoading: isOrgSurveysLoading } =
    useTeacherOrganisatioSurveys(queryParams)

  const getPageTitle = () => {
    const baseTitle = t('teacherView:mainHeading')

    switch (status) {
      case 'active':
        return `${t('teacherView:activeSurveys')} | ${baseTitle}`
      case 'upcoming':
        return `${t('teacherView:upcomingSurveys')} | ${baseTitle}`
      case 'ended':
        return `${t('teacherView:endedSurveys')} | ${baseTitle}`
      default:
        return baseTitle
    }
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Title>{getPageTitle()}</Title>
      <Typography id="my-teaching-title" variant="h4" component="h1">
        {t('teacherView:mainHeading')}
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
          countLabel={t('teacherView:endedBadgeLabel', { count: tabCounts?.ended })}
          badgeColor="error"
          icon={<EndedIcon />}
          iconPosition="start"
        />
      </StatusTabs>

      {isLoading && isOrgSurveysLoading && <CourseUnitGroupSkeleton />}

      {orgSurveyCourseUnits?.length === 0 && courseUnits?.length === 0 && (
        <Alert data-cy="my-teaching-no-courses" severity="info">
          {status === 'ended' ? t('teacherView:noFilteredCourses') : t('teacherView:noCourses')}
        </Alert>
      )}

      {status === 'ended' && <FilterRow dateRange={dateRange} setDateRange={setDateRange} />}

      {orgSurveyCourseUnits?.length > 0 && (
        <RenderCourseUnitGroup
          groupTitle={t('teacherView:organisationSurveys')}
          courseUnits={orgSurveyCourseUnits}
          status={status}
        />
      )}

      {courseUnits?.length > 0 && (
        <RenderCourseUnitGroup groupTitle={t('teacherView:courseSurveys')} courseUnits={courseUnits} status={status} />
      )}
    </Box>
  )
}

export default MyTeaching
