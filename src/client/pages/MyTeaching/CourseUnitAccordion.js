import React from 'react'
import { useTranslation } from 'react-i18next'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material'

import FeedbackTargetList from './FeedbackTargetList'
import InterimFeedbackChip from './InterimFeedbackChip'
import FeedbackResponseChip from './FeedbackResponseChip'

import { useInterimFeedbackParent } from '../FeedbackTarget/tabs/InterimFeedback/useInterimFeedbacks'

import { getRelevantCourseRealisation } from './utils'

import { getLanguageValue } from '../../util/languageUtils'
import { getCourseCode } from '../../util/courseIdentifiers'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsOld from '../../util/feedbackTargetIsOld'
import feedbackTargetCourseIsOngoing from '../../util/feedbackTargetCourseIsOngoing'

const styles = {
  accordion: {
    boxShadow: 'none',
    margin: '0px !important',
    '&:before': {
      display: 'none',
    },
  },
  details: {
    display: 'block',
    padding: 0,
  },
}

const getChip = (courseRealisation, code) => {
  const { feedbackResponseGiven, feedbackResponseSent, feedbackTarget, feedbackCount } = courseRealisation

  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isOld = feedbackTargetIsOld(feedbackTarget)
  const { id: feedbackTargetId, continuousFeedbackEnabled, opensAt } = feedbackTarget || {}
  const isOngoing = feedbackTargetCourseIsOngoing({ opensAt, courseRealisation }) && !isOpen

  if (isOpen || (isOngoing && continuousFeedbackEnabled) || (feedbackCount > 0 && isEnded) || feedbackResponseGiven) {
    return (
      <FeedbackResponseChip
        id={feedbackTargetId}
        feedbackResponseGiven={feedbackResponseGiven}
        feedbackResponseSent={feedbackResponseSent}
        isOld={isOld}
        ongoing={isOpen}
        continuous={isOngoing && continuousFeedbackEnabled}
        data-cy={`feedbackResponseGiven-${code}-${feedbackResponseGiven}`}
      />
    )
  }

  return null
}

const getInterimFeedbackChip = courseRealisation => {
  const { feedbackTarget } = courseRealisation
  const { parentFeedback, isLoading: isParentFeedbackLoading } = useInterimFeedbackParent(
    feedbackTarget?.id,
    feedbackTarget?.userCreated
  )

  if (isParentFeedbackLoading || !parentFeedback) return null

  return <InterimFeedbackChip id={parentFeedback.id} />
}

const CourseUnitAccordion = ({ courseUnit, group }) => {
  const { i18n } = useTranslation()
  const { name, courseCode } = courseUnit

  const courseRealisation = getRelevantCourseRealisation(courseUnit, group)
  const visibleCourseCode = getCourseCode(courseUnit)
  const FeedbackResponseChip = getChip(courseRealisation, courseCode)
  const InterimFeedbackChip = getInterimFeedbackChip(courseRealisation)

  return (
    <Accordion
      sx={styles.accordion}
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
      data-cy="courseUnitItem"
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} data-cy={`courseUnitAccordion-${courseCode}`}>
        <Box>
          <Typography>
            {visibleCourseCode} {getLanguageValue(name, i18n.language)}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {FeedbackResponseChip}
            {InterimFeedbackChip}
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
