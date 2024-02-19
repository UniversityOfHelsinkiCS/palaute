import React from 'react'
import _ from 'lodash'
import qs from 'qs'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { Alert, Box, Typography, Skeleton } from '@mui/material'

import { useTeacherCourseUnits, useTeacherOrganisatioSurveys } from './useTeacherCourseUnits'

import useCourseUnitGridColumns from './useCourseUnitGridColumns'

import StatusTabs from './StatusTabs'
import CourseUnitItem from './CourseUnitGroup/CourseUnitItem'
import CourseUnitAccordion from './CourseUnitGroup/CourseUnitAccordion'
import CourseUnitGroup from './CourseUnitGroup/CourseUnitGroup'
import CourseUnitGroupGrid from './CourseUnitGroup/CourseUnitGroupGrid'
import CourseUnitGroupTitle from './CourseUnitGroup/CourseUnitGroupTitle'
import CourseUnitGroupGridColumn from './CourseUnitGroup/CourseUnitGroupGridColumn'

import Title from '../../../components/common/Title'

const CourseUnitGroupSkeleton = () => (
  <>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

const RenderCourseUnitGroup = ({ groupTitle, courseUnits, status }) => {
  const theme = useTheme()
  const gridColumns = useCourseUnitGridColumns(theme)

  const columnCourseUnits = _.chunk(courseUnits, Math.ceil(courseUnits.length / gridColumns))

  const CourseUnitComponent = status === 'ongoing' ? CourseUnitItem : CourseUnitAccordion

  return (
    <CourseUnitGroup>
      <CourseUnitGroupTitle title={groupTitle} badgeContent={courseUnits?.length} />
      <CourseUnitGroupGrid>
        {columnCourseUnits.map((courseUnitColumn, i) => (
          <CourseUnitGroupGridColumn key={`course-unit-grid-column-${i + 1}`}>
            {courseUnitColumn.map(courseUnit => (
              <CourseUnitComponent key={courseUnit.courseCode} courseUnit={courseUnit} />
            ))}
          </CourseUnitGroupGridColumn>
        ))}
      </CourseUnitGroupGrid>
    </CourseUnitGroup>
  )
}

const MyTeaching = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const { status = 'ongoing' } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })

  const { courseUnits, isLoading } = useTeacherCourseUnits({ status })
  const { courseUnits: orgSurveyCourseUnits, isLoading: isOrgSurveysLoading } = useTeacherOrganisatioSurveys({ status })

  return (
    <>
      <Title>{t('common:teacherPage')}</Title>
      <Box mb={2}>
        <Typography id="my-teaching-title" variant="h4" component="h1">
          {t('teacherView:mainHeading')}
        </Typography>
      </Box>

      <StatusTabs
        aria-labelledby="my-teaching-title"
        sx={{ marginBottom: 3 }}
        status={status}
        counts={{
          ongoing: 0,
          upcoming: 0,
          ended: 0,
        }}
      />

      {isOrgSurveysLoading && <CourseUnitGroupSkeleton />}

      {isLoading && <CourseUnitGroupSkeleton />}

      {orgSurveyCourseUnits?.length === 0 && courseUnits?.length === 0 && (
        <Alert data-cy="my-teaching-no-courses" severity="info">
          {t('teacherView:noCoursesV2')}
        </Alert>
      )}

      {orgSurveyCourseUnits?.length > 0 && (
        <RenderCourseUnitGroup groupTitle="Organisaatiokyselyt" courseUnits={orgSurveyCourseUnits} status={status} />
      )}

      {courseUnits?.length > 0 && (
        <RenderCourseUnitGroup groupTitle="Yliopistokurssit" courseUnits={courseUnits} status={status} />
      )}
    </>
  )
}

export default MyTeaching
