import React, { useEffect } from 'react'
import { chunk } from 'lodash-es'
import qs from 'qs'
import { format, isValid } from 'date-fns'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { Alert, Box, Typography, Skeleton, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
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
import { useYear, getYearRange } from '../../util/yearUtils'
import { STUDY_YEAR_START_MONTH } from '../../util/common'
import useURLSearchParams from '../../hooks/useURLSearchParams'

const styles = {
  stepperContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '4px',
    paddingRight: '4px',
    marginBottom: '4px',
  },
  stepperValue: {
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  button: {
    color: theme => theme.palette.info.main,
    '&:hover': {
      background: theme => theme.palette.action.hover,
      color: theme => theme.palette.text.primary,
    },
    '&:active': {
      background: theme => theme.palette.action.selected,
    },
    marginX: '0.4rem',
  },
  disabledButton: {
    opacity: '0.0',
    zIndex: -10,
  },
}

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

const AcademicYearSelector = ({ value, onChange, labelledBy }) => {
  const NOW = new Date()
  const MIN_YEAR = 2020
  const CURRENT_YEAR = NOW.getFullYear() + (NOW.getMonth() + 1 >= STUDY_YEAR_START_MONTH ? 1 : 0)

  const displayValue = `${value} – ${value + 1}`

  const canIncrease = value + 1 < CURRENT_YEAR
  const canDecrease = value > MIN_YEAR

  const handleIncrease = (increment = 1) => {
    if (value + increment <= CURRENT_YEAR) {
      onChange(value + increment)
    }
    if (value + increment >= CURRENT_YEAR) {
      onChange(CURRENT_YEAR - 1)
    }
  }

  const handleDecrease = (decrement = 1) => {
    if (value - decrement >= MIN_YEAR) {
      onChange(value - decrement)
    }
  }

  const handleSetMaxValue = () => {
    onChange(CURRENT_YEAR - 1)
  }

  const handleSetMinValue = () => {
    onChange(MIN_YEAR)
  }

  // Handle keyboard events per the following document: https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
  const handleKeyPress = event => {
    let flag = false

    switch (event.code) {
      case 'ArrowDown':
        handleDecrease()
        flag = true
        break

      case 'ArrowUp':
        handleIncrease()
        flag = true
        break

      case 'Home':
        handleSetMinValue()
        flag = true
        break

      case 'End':
        handleSetMaxValue()
        flag = true
        break

      default:
        break
    }

    if (flag) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (
    <Box
      id="academic-year-selector"
      tabIndex={0}
      sx={styles.stepperContainer}
      role="spinbutton"
      aria-labelledby={labelledBy ?? undefined}
      aria-valuenow={value}
      aria-valuemin={MIN_YEAR}
      aria-valuemax={CURRENT_YEAR - 1}
      aria-valuetext={displayValue}
      onKeyDown={handleKeyPress}
    >
      <IconButton
        tabIndex={-1}
        onClick={() => handleDecrease()}
        disabled={!canDecrease}
        sx={[!canDecrease ? styles.disabledButton : {}, styles.button]}
        size="small"
        disableTouchRipple
      >
        <ChevronLeft />
      </IconButton>
      <Typography component="span" sx={styles.stepperValue}>
        {displayValue}
      </Typography>
      <IconButton
        tabIndex={-1}
        onClick={() => handleIncrease()}
        disabled={!canIncrease}
        sx={[!canIncrease ? styles.disabledButton : {}, styles.button]}
        size="small"
        disableTouchRipple
      >
        <ChevronRight />
      </IconButton>
    </Box>
  )
}

const FilterRow = ({ dateRange, setDateRange }) => {
  const { t } = useTranslation()
  const [params, setParams] = useURLSearchParams()

  const year = useYear(dateRange.start)
  const range = getYearRange(new Date(`${year + 1}-01-01`))

  useEffect(() => {
    if (!params.get('startDate') || !params.get('endDate')) {
      params.set('startDate', format(new Date(range.start), 'yyyy-MM-dd'))
      params.set('endDate', format(new Date(range.end), 'yyyy-MM-dd'))
      setParams(params)
      setDateRange({ start: range.start, end: range.end })
    }
  }, [params, setParams])

  const handleChangeTimeRange = nextYear => {
    const newRange = getYearRange(new Date(`${nextYear + 1}-01-01`))

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

  const ongoingAcademicYearRange = getYearRange(new Date())

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
