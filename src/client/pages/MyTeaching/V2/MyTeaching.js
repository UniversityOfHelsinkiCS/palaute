import React from 'react'
import _ from 'lodash'
import qs from 'qs'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { Alert, Box, Typography } from '@mui/material'

import useTeacherCourseUnits from '../../../hooks/useTeacherCourseUnits'

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

import { getGroupedCourseUnits } from '../utils'

const MyTeaching = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const location = useLocation()
  const gridColumns = useCourseUnitGridColumns(theme)

  const { status = 'ongoing' } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })

  const { courseUnits, isLoading } = useTeacherCourseUnits()

  const groupedCourseUnits = getGroupedCourseUnits(courseUnits)
  const sortedCourseUnits = groupedCourseUnits[status]
  const columnCourseUnits = _.chunk(sortedCourseUnits, Math.ceil(sortedCourseUnits.length / gridColumns))

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

      {!isLoading && sortedCourseUnits?.length === 0 && (
        <Alert data-cy="my-teaching-no-courses" severity="info">
          {t('teacherView:noCoursesV2')}
        </Alert>
      )}

      {!isLoading && status === 'ongoing' ? (
        <CourseUnitGroup>
          <CourseUnitGroupTitle title="Yliopistokurssit" badgeContent={sortedCourseUnits.length} />
          <CourseUnitGroupGrid>
            {columnCourseUnits.map((courseUnitColumn, i) => (
              <CourseUnitGroupGridColumn key={`course-unit-grid-column-${i + 1}`}>
                {courseUnitColumn.map(courseUnit => (
                  <CourseUnitItem key={courseUnit.courseCode} courseUnit={courseUnit} group={status.toUpperCase()} />
                ))}
              </CourseUnitGroupGridColumn>
            ))}
          </CourseUnitGroupGrid>
        </CourseUnitGroup>
      ) : (
        <CourseUnitGroup>
          <CourseUnitGroupTitle title="Yliopistokurssit" badgeContent={sortedCourseUnits.length} />
          <CourseUnitGroupGrid>
            {columnCourseUnits.map((courseUnitColumn, i) => (
              <CourseUnitGroupGridColumn key={`course-unit-grid-column-${i + 1}`}>
                {courseUnitColumn.map(courseUnit => (
                  <CourseUnitAccordion
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
