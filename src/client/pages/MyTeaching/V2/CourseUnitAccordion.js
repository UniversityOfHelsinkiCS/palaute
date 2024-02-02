import React from 'react'
import { useTranslation } from 'react-i18next'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material'

import FeedbackTargetList from './FeedbackTargetList/FeedbackTargetList'
import InterimFeedbackChip from './chips/InterimFeedbackChip'

import FeedbackResponseChip from '../FeedbackResponseChip'

import { getRelevantCourseRealisation } from '../utils'

import feedbackTargetIsEnded from '../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../../util/feedbackTargetIsOpen'
import feedbackTargetIsOld from '../../../util/feedbackTargetIsOld'
import feedbackTargetCourseIsOngoing from '../../../util/feedbackTargetCourseIsOngoing'
import { getLanguageValue } from '../../../util/languageUtils'
import { getCourseCode } from '../../../util/courseIdentifiers'

const styles = {
  accordion: {
    boxShadow: 'none',
    margin: '0px !important',
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

const CourseUnitAccordion = ({ courseUnit, group }) => {
  const { i18n } = useTranslation()

  const { name, courseCode } = courseUnit

  console.log(courseUnit)

  const courseRealisation = getRelevantCourseRealisation(courseUnit, group)
  const visibleCourseCode = getCourseCode(courseUnit)

  const { feedbackResponseGiven, feedbackResponseSent, feedbackTarget, feedbackCount } = courseRealisation
  const { id: feedbackTargetId, continuousFeedbackEnabled, opensAt } = feedbackTarget || {}

  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isOld = feedbackTargetIsOld(feedbackTarget)

  const isOngoing = feedbackTargetCourseIsOngoing({ opensAt, courseRealisation }) && !isOpen

  // Check that the feedback target is not an interim feedback or a organisation survey
  const fetchInterimFeedbackChip = !feedbackTarget.userCreated && !courseUnit.userCreated
  const fetchFeedbackResponseChip =
    isOpen || (isOngoing && continuousFeedbackEnabled) || (feedbackCount > 0 && isEnded) || feedbackResponseGiven

  return (
    <Accordion
      sx={styles.accordion}
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
      data-cy="my-teaching-course-unit-item"
    >
      <AccordionSummary
        id={`course-unit-accordion-header-${courseCode}`}
        aria-controls={`course-unit-accordion-content-${courseCode}`}
        expandIcon={<ExpandMoreIcon />}
        data-cy={`my-teaching-course-unit-accordion-${courseCode}`}
      >
        <Box>
          <Typography component="h3" variant="body1" sx={{ mr: 2 }}>
            {visibleCourseCode} {getLanguageValue(name, i18n.language)}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {fetchFeedbackResponseChip && (
              <FeedbackResponseChip
                id={feedbackTargetId}
                feedbackResponseGiven={feedbackResponseGiven}
                feedbackResponseSent={feedbackResponseSent}
                isOld={isOld}
                ongoing={isOpen}
                continuous={isOngoing && continuousFeedbackEnabled}
                data-cy={`feedbackResponseGiven-${courseCode}-${feedbackResponseGiven}`}
              />
            )}
            {fetchInterimFeedbackChip && <InterimFeedbackChip parentFeedbackTarget={feedbackTarget} />}
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={styles.details}>
        <FeedbackTargetList courseCode={courseCode} group={group} />
      </AccordionDetails>
    </Accordion>
  )
}

export default CourseUnitAccordion
