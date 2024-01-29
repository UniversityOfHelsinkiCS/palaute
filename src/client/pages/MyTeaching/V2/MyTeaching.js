import React from 'react'
import { useLocation } from 'react-router-dom'
import qs from 'qs'

import { Alert, Box, Typography } from '@mui/material'

import { useTranslation } from 'react-i18next'

import useTeacherCourseUnits from '../../../hooks/useTeacherCourseUnits'

import StatusTabs from './StatusTabs'
import CourseUnitAccordion from './CourseUnitAccordion'
import CourseUnitGroup from './CourseUnitGroup/CourseUnitGroup'
import CourseUnitGroupGrid from './CourseUnitGroup/CourseUnitGroupGrid'
import CourseUnitGroupTitle from './CourseUnitGroup/CourseUnitGroupTitle'
import CourseUnitGroupGridItem from './CourseUnitGroup/CourseUnitGroupGridItem'

import Title from '../../../components/common/Title'
import { LoadingProgress } from '../../../components/common/LoadingProgress'

import { getGroupedCourseUnits } from '../utils'

const MyTeaching = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const { status = 'ongoing' } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })

  const { courseUnits, isLoading } = useTeacherCourseUnits()

  const groupedCourseUnits = getGroupedCourseUnits(courseUnits)
  const sortedCourseUnits = groupedCourseUnits[status]

  return (
    <>
      <Title>{t('common:teacherPage')}</Title>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {t('teacherView:mainHeading')}
        </Typography>
      </Box>

      <StatusTabs
        sx={{ marginBottom: 3 }}
        status={status}
        counts={{
          ongoing: groupedCourseUnits.ongoing?.length,
          waiting: groupedCourseUnits.upcoming?.length,
          given: groupedCourseUnits.ended?.length,
        }}
      />

      {isLoading && <LoadingProgress />}

      {!isLoading && sortedCourseUnits?.length === 0 ? (
        <Alert data-cy="my-teaching-no-courses" severity="info">
          {t('teacherView:noCoursesV2')}
        </Alert>
      ) : (
        <CourseUnitGroup>
          <CourseUnitGroupTitle title="Yliopistokurssit" badgeContent={sortedCourseUnits.length} />
          <CourseUnitGroupGrid>
            {sortedCourseUnits.map(courseUnit => (
              <CourseUnitGroupGridItem key={courseUnit.courseCode}>
                <CourseUnitAccordion courseUnit={courseUnit} group={status.toUpperCase()} />
              </CourseUnitGroupGridItem>
            ))}
          </CourseUnitGroupGrid>
        </CourseUnitGroup>
      )}
    </>
  )
}

export default MyTeaching
