import React from 'react'
import { useTranslation } from 'react-i18next'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material'

import FeedbackTargetList from './FeedbackTargetList'
import InterimFeedbackChip from './InterimFeedbackChip'
import FeedbackResponseChip from './FeedbackResponseChip'

import {
  useInterimFeedbacks,
  useInterimFeedbackParent,
} from '../FeedbackTarget/tabs/InterimFeedback/useInterimFeedbacks'

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
  const { parentFeedback } = useInterimFeedbackParent(feedbackTarget.id)

  const acualFeeback = parentFeedback || feedbackTarget

  const isEnded = feedbackTargetIsEnded(acualFeeback)
  const isOpen = feedbackTargetIsOpen(acualFeeback)
  const isOld = feedbackTargetIsOld(acualFeeback)
  const { id: feedbackTargetId, continuousFeedbackEnabled, opensAt } = acualFeeback || {}
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

const getInterimFeedbackChip = (courseRealisation, enable) => {
  const { feedbackTarget } = courseRealisation
  const { interimFeedbacks, isLoading: isInterimFeedbacksLoading } = useInterimFeedbacks(feedbackTarget?.id, enable)

  if (!enable || isInterimFeedbacksLoading || interimFeedbacks?.length === 0) return null

  const isOpen = interimFeedbacks.some(target => feedbackTargetIsOpen(target))

  if (!isOpen) return null

  return <InterimFeedbackChip id={feedbackTarget.id} />
}

const CourseUnitAccordion = ({ courseUnit, group }) => {
  const { i18n } = useTranslation()
  const { name, courseCode } = courseUnit

  const courseRealisation = getRelevantCourseRealisation(courseUnit, group)
  const visibleCourseCode = getCourseCode(courseUnit)
  const FeedbackResponseChip = getChip(courseRealisation, courseCode)
  const InterimFeedbackChip = getInterimFeedbackChip(courseRealisation, !courseUnit.userCreated)

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
            <Box sx={{ mr: 1 }}>{FeedbackResponseChip}</Box>
            <Box>{InterimFeedbackChip}</Box>
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
