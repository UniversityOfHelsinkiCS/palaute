import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography } from '@mui/material'

import DisabledCourseWarning from './DisabledCourseWarning'
import FeedbackTargetList from '../FeedbackTargetList/FeedbackTargetList'

import commonStyles from '../utils/styles'

import { getLanguageValue } from '../../../../util/languageUtils'
import { getCourseCode } from '../../../../util/courseIdentifiers'

const styles = {
  item: {
    minHeight: '100px',
  },
  details: {
    display: 'block',
    padding: 0,
  },
}

const CourseUnitItem = ({ courseUnit }) => {
  const { i18n } = useTranslation()

  const { name, courseRealisations, disabledCourse, courseCode } = courseUnit

  const visibleCourseCode = getCourseCode(courseUnit)
  const courseName = getLanguageValue(name, i18n.language)

  return (
    <Box sx={{ ...styles.item }} data-cy={`my-teaching-course-unit-item-${visibleCourseCode || courseCode}`}>
      <Box sx={{ px: 2, py: 2, ...(disabledCourse && commonStyles.alert) }}>
        <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {visibleCourseCode} {courseName}
        </Typography>
        {disabledCourse && <DisabledCourseWarning />}
      </Box>

      <Box sx={styles.details}>
        {courseRealisations.map(courseRealisation => (
          <FeedbackTargetList key={courseRealisation.id} courseRealisation={courseRealisation} />
        ))}
      </Box>
    </Box>
  )
}

export default CourseUnitItem
