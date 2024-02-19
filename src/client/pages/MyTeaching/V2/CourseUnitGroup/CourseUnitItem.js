import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography } from '@mui/material'

import DisabledCourseWarning from './DisabledCourseWarning'

import FeedbackTargetList from '../FeedbackTargetList/FeedbackTargetList'
import InterimFeedbackChip from '../chips/InterimFeedbackChip'

import commonStyles from '../utils/styles'

import { getLanguageValue } from '../../../../util/languageUtils'
import { getCourseCode } from '../../../../util/courseIdentifiers'

const styles = {
  item: {
    backgroundColor: 'white',
    mt: 2,
    '&:before': {
      display: 'none',
    },
    minHeight: '100px',
  },
  details: {
    display: 'block',
    padding: 0,
  },
}

const CourseUnitItem = ({ courseUnit }) => {
  const { i18n } = useTranslation()

  const { name, courseRealisations, disabledCourse } = courseUnit

  const visibleCourseCode = getCourseCode(courseUnit)
  const courseName = getLanguageValue(name, i18n.language)

  return (
    <Box sx={{ ...styles.item, ...(disabledCourse && commonStyles.alert) }} data-cy="my-teaching-course-unit-item">
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {visibleCourseCode} {courseName}
        </Typography>
        {disabledCourse && <DisabledCourseWarning />}

        {/* {interimFeedbackTargets.length > 0 && <InterimFeedbackChip parentFeedbackTarget={feedbackTarget} />} */}
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
