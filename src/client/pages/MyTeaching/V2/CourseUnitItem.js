import React from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Typography } from '@mui/material'

import FeedbackTargetList from './FeedbackTargetList/FeedbackTargetList'
import InterimFeedbackChip from './chips/InterimFeedbackChip'

import { getRelevantCourseRealisation } from '../utils'

import { getLanguageValue } from '../../../util/languageUtils'
import { getCourseCode } from '../../../util/courseIdentifiers'

const CourseUnitItem = ({ courseUnit, group }) => {
  const { i18n } = useTranslation()

  const { name, courseCode } = courseUnit

  const courseRealisation = getRelevantCourseRealisation(courseUnit, group)
  const visibleCourseCode = getCourseCode(courseUnit)

  const { feedbackTarget } = courseRealisation

  // Check that the feedback target is not an interim feedback or a organisation survey
  const fetchInterimFeedbackChip = !feedbackTarget.userCreated && !courseUnit.userCreated

  return (
    <Box sx={{ pt: 2 }} data-cy="my-teaching-course-unit-item">
      <Box sx={{ px: 2 }}>
        <Typography component="h3" variant="body1">
          {visibleCourseCode} {getLanguageValue(name, i18n.language)}
        </Typography>

        {fetchInterimFeedbackChip && <InterimFeedbackChip parentFeedbackTarget={feedbackTarget} />}
      </Box>

      <Box sx={{ display: 'block', padding: 0 }}>
        <FeedbackTargetList courseCode={courseCode} group={group} />
      </Box>
    </Box>
  )
}

export default CourseUnitItem
