import React from 'react'
import { useTranslation } from 'react-i18next'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material'

import FeedbackTargetList from '../FeedbackTargetList/FeedbackTargetList'
import DisabledCourseWarning from './DisabledCourseWarning'

import commonStyles from '../utils/styles'
import { getLatestFeedbackTarget, hasOngoingInterimFeedbacks } from '../utils/utils'

import { getLanguageValue } from '../../../util/languageUtils'
import { getCourseCode } from '../../../util/courseIdentifiers'

import FeedbackResponseChip from '../chips/FeedbackResponseChip'
import InterimFeedbackChip from '../chips/InterimFeedbackChip'
import feedbackTargetIsOpen from '../../../util/feedbackTargetIsOpen'
import feedbackTargetCourseIsOngoing from '../../../util/feedbackTargetCourseIsOngoing'
import { SHOW_CHIPS_AT_COURSE_UNIT_LEVEL_IN_ACCORDIONS } from '../../../util/common'

const styles = {
  accordion: {
    boxShadow: 'none',
    border: 'none',
    minHeight: '75px',
  },
  details: {
    display: 'block',
    padding: 0,
  },
}

const CourseUnitAccordion = ({ courseUnit }) => {
  const { i18n } = useTranslation()

  const { name, courseCode, courseRealisations, disabledCourse } = courseUnit

  const visibleCourseCode = getCourseCode(courseUnit)
  const courseName = getLanguageValue(name, i18n.language)
  const latestFeedbackTarget = getLatestFeedbackTarget(courseRealisations)

  const { id, feedbackResponseGiven, feedbackResponseSent, summary, isEnded, isOld } = latestFeedbackTarget
  const feedbackCount = summary?.data?.feedbackCount ?? 0

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
    <Accordion
      sx={{
        ...styles.accordion,
      }}
      data-cy="my-teaching-course-unit-item"
      disableGutters
    >
      <AccordionSummary
        id={`course-unit-accordion-header-${courseCode}`}
        aria-controls={`course-unit-accordion-content-${courseCode}`}
        expandIcon={<ExpandMoreIcon />}
        data-cy={`my-teaching-course-unit-accordion-${courseCode}`}
        sx={{
          ...(disabledCourse && commonStyles.alert),
          '.MuiAccordionSummary-content': { flexDirection: 'column' },
        }}
      >
        <Box>
          <Typography component="h3" variant="subtitle1" sx={{ mr: 2, fontWeight: 'bold' }}>
            {visibleCourseCode} {courseName}
          </Typography>

          {disabledCourse && <DisabledCourseWarning />}
        </Box>
        <Box sx={{ pr: 2, pt: 1, display: 'flex', flexWrap: 'wrap' }}>
          <Box>
            {!isOld && isEnded && !feedbackResponseGiven && feedbackCount > 0 && (
              <FeedbackResponseChip
                id={id}
                feedbackResponseGiven={feedbackResponseGiven}
                feedbackResponseSent={feedbackResponseSent}
                isOld={isOld}
              />
            )}
          </Box>

          {SHOW_CHIPS_AT_COURSE_UNIT_LEVEL_IN_ACCORDIONS && (
            <Box>
              <Box sx={{ mr: 1 }}>{fetchInterimFeedbackChip && <InterimFeedbackChip />}</Box>
            </Box>
          )}

          {SHOW_CHIPS_AT_COURSE_UNIT_LEVEL_IN_ACCORDIONS &&
            (ongoingFeedbackTargetFound || continuousFeedbackTargetFound) && (
              <Box>
                <FeedbackResponseChip
                  id={undefined}
                  ongoing={ongoingFeedbackTargetFound}
                  continuous={continuousFeedbackTargetFound}
                />
              </Box>
            )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={styles.details}>
        {courseRealisations.map(courseRealisation => (
          <FeedbackTargetList key={courseRealisation.id} courseRealisation={courseRealisation} />
        ))}
      </AccordionDetails>
    </Accordion>
  )
}

export default CourseUnitAccordion
