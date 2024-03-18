import React from 'react'
import _ from 'lodash'
import qs from 'qs'
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

const CourseUnitGroupSkeleton = () => (
  <>
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 6 }}>
      <Skeleton>
        <Typography id="my-teaching-title" variant="h5">
          Yliopistokurssit
        </Typography>
      </Skeleton>
      <Skeleton variant="circular" width={20} height={20} sx={{ marginLeft: '1.5rem' }} />
    </Box>

    <Skeleton variant="rectangular" height={250} />
  </>
)

const RenderCourseUnitGroup = ({ groupTitle, courseUnits, status, expandable = false }) => {
  const theme = useTheme()
  const gridColumns = useCourseUnitGridColumns(theme)

  const columnCourseUnits = _.chunk(courseUnits, Math.ceil(courseUnits.length / gridColumns))

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

const MyTeaching = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const { status = 'active' } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })

  const { courseUnits, isLoading } = useTeacherCourseUnits({ status })
  const { courseUnits: orgSurveyCourseUnits, isLoading: isOrgSurveysLoading } = useTeacherOrganisatioSurveys({ status })

  return (
    <>
      <Title>{t('common:teacherPage')}</Title>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Typography id="my-teaching-title" variant="h4" component="h1">
          {t('teacherView:mainHeadingV2')}
        </Typography>
      </Box>

      <StatusTabs aria-labelledby="my-teaching-title" sx={{ marginBottom: 3 }} status={status}>
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
          color="error"
          count={0}
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
    </>
  )
}

export default MyTeaching
