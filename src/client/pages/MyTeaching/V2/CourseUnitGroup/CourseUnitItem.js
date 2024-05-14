import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography } from '@mui/material'

import DisabledCourseWarning from './DisabledCourseWarning'
import FeedbackTargetList from '../FeedbackTargetList/FeedbackTargetList'

import commonStyles from '../utils/styles'

import { getLanguageValue } from '../../../../util/languageUtils'
import { getCourseCode } from '../../../../util/courseIdentifiers'
import { hasOngoingInterimFeedbacks } from '../utils/utils'
import InterimFeedbackChip from '../chips/InterimFeedbackChip'
import FeedbackResponseChip from '../../FeedbackResponseChip'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import feedbackTargetCourseIsOngoing from '../../../../util/feedbackTargetCourseIsOngoing'

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

  let continuousFeedbackTargetFound = false
  let ongoingFeedbackTargetFound = false
  courseRealisations.forEach(cr => {
    if (cr.feedbackTargets) {
      for (const fbt of cr.feedbackTargets) {
        const isOpen = feedbackTargetIsOpen(fbt)
        const { opensAt } = fbt
        const isOngoing = feedbackTargetCourseIsOngoing({ courseRealisation: cr, opensAt }) && !isOpen
        if (isOngoing && fbt.continuousFeedbackEnabled) {
          continuousFeedbackTargetFound = true
        } else if (isOpen) {
          ongoingFeedbackTargetFound = true
        }
      }
    }
  })

  const fetchInterimFeedbackChip = courseRealisations.some(courseRealisation =>
    hasOngoingInterimFeedbacks(courseRealisation.interimFeedbackTargets)
  )

  return (
    <Box sx={{ ...styles.item }} data-cy={`my-teaching-course-unit-item-${visibleCourseCode || courseCode}`}>
      <Box sx={{ px: 2, paddingTop: 1, paddingBottom: 0, ...(disabledCourse && commonStyles.alert) }}>
        <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {visibleCourseCode} {courseName}
        </Typography>
        {disabledCourse && <DisabledCourseWarning />}
      </Box>

      <Box sx={{ px: 2, py: 0, display: 'flex', flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ mr: 1 }}>{fetchInterimFeedbackChip && <InterimFeedbackChip />}</Box>
        </Box>

        <Box>
          <Box>
            {(ongoingFeedbackTargetFound || continuousFeedbackTargetFound) && (
              <FeedbackResponseChip
                id={undefined}
                ongoing={ongoingFeedbackTargetFound}
                continuous={continuousFeedbackTargetFound}
              />
            )}
          </Box>
        </Box>
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
