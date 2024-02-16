import React from 'react'
import _ from 'lodash'
import qs from 'qs'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { Alert, Box, Typography } from '@mui/material'

import useTeacherCourseUnits from './useTeacherCourseUnits'

import useCourseUnitGridColumns from './useCourseUnitGridColumns'

import StatusTabs from './StatusTabs'
import CourseUnitItem from './CourseUnitItem'
import CourseUnitAccordion from './CourseUnitAccordion'
import CourseUnitGroup from './CourseUnitGroup/CourseUnitGroup'
import CourseUnitGroupGrid from './CourseUnitGroup/CourseUnitGroupGrid'
import CourseUnitGroupTitle from './CourseUnitGroup/CourseUnitGroupTitle'
import CourseUnitGroupGridColumn from './CourseUnitGroup/CourseUnitGroupGridColumn'

import Title from '../../../components/common/Title'
import { LoadingProgress } from '../../../components/common/LoadingProgress'

const MyTeaching = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const location = useLocation()
  const gridColumns = useCourseUnitGridColumns(theme)

  const { status = 'ongoing' } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })

  const { courseUnits, isLoading } = useTeacherCourseUnits({ status })

  if (isLoading) return null

  console.log(courseUnits)

  const columnCourseUnits = _.chunk(courseUnits, Math.ceil(courseUnits.length / gridColumns))

  const CourseUnitComponent = status === 'ongoing' ? CourseUnitItem : CourseUnitAccordion

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
          ongoing: 0,
          upcoming: 0,
          ended: 0,
        }}
      />

      {isLoading && <LoadingProgress />}

      {!isLoading && courseUnits?.length === 0 ? (
        <Alert data-cy="my-teaching-no-courses" severity="info">
          {t('teacherView:noCoursesV2')}
        </Alert>
      ) : (
        <CourseUnitGroup>
          <CourseUnitGroupTitle title="Yliopistokurssit" badgeContent={courseUnits.length} />
          <CourseUnitGroupGrid>
            {columnCourseUnits.map((courseUnitColumn, i) => (
              <CourseUnitGroupGridColumn key={`course-unit-grid-column-${i + 1}`}>
                {courseUnitColumn.map(courseUnit => (
                  <CourseUnitComponent
                    key={courseUnit.courseCode}
                    courseUnit={courseUnit}
                    group={status.toUpperCase()}
                  />
                ))}
              </CourseUnitGroupGridColumn>
            ))}
          </CourseUnitGroupGrid>
        </CourseUnitGroup>
      )}
    </>
  )
}

export default MyTeaching
