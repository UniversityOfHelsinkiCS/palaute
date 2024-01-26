import React from 'react'
import { useTranslation } from 'react-i18next'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material'

import FeedbackTargetList from '../FeedbackTargetList'
import InterimFeedbackChip from '../InterimFeedbackChip'
import FeedbackResponseChip from '../FeedbackResponseChip'

import {
  useInterimFeedbacks,
  useInterimFeedbackParent,
} from '../../FeedbackTarget/tabs/InterimFeedback/useInterimFeedbacks'

import { getRelevantCourseRealisation } from '../utils'

import { getLanguageValue } from '../../../util/languageUtils'
import { getCourseCode } from '../../../util/courseIdentifiers'
import feedbackTargetIsEnded from '../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../../util/feedbackTargetIsOpen'
import feedbackTargetIsOld from '../../../util/feedbackTargetIsOld'
import feedbackTargetCourseIsOngoing from '../../../util/feedbackTargetCourseIsOngoing'

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

const RenderFeedbackResponseChip = ({ courseRealisation, code }) => {
  const { feedbackResponseGiven, feedbackResponseSent, feedbackTarget, feedbackCount } = courseRealisation

  const { parentFeedback } = useInterimFeedbackParent(feedbackTarget.id, feedbackTarget.userCreated)

  const acualFeedback = parentFeedback || feedbackTarget

  const isEnded = feedbackTargetIsEnded(acualFeedback)
  const isOpen = feedbackTargetIsOpen(acualFeedback)
  const isOld = feedbackTargetIsOld(acualFeedback)
  const { id: feedbackTargetId, continuousFeedbackEnabled, opensAt } = acualFeedback || {}
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

const RenderInterimFeedbackChip = ({ parentFeedbackTarget }) => {
  const isEnded = feedbackTargetIsEnded(parentFeedbackTarget)
  const isOld = feedbackTargetIsOld(parentFeedbackTarget)

  const fetchInterimFeedbacks = !parentFeedbackTarget.userCreated && !isEnded && !isOld

  const { interimFeedbacks, isLoading: isInterimFeedbacksLoading } = useInterimFeedbacks(
    parentFeedbackTarget?.id,
    fetchInterimFeedbacks
  )

  if (!fetchInterimFeedbacks || isInterimFeedbacksLoading || interimFeedbacks?.length === 0) return null

  const isOpenInterim = interimFeedbacks.some(target => feedbackTargetIsOpen(target))

  if (!isOpenInterim) return null

  return <InterimFeedbackChip id={parentFeedbackTarget.id} />
}

const CourseUnitAccordion = ({ courseUnit, group }) => {
  const { i18n } = useTranslation()
  const { name, courseCode } = courseUnit

  const courseRealisation = getRelevantCourseRealisation(courseUnit, group)
  const visibleCourseCode = getCourseCode(courseUnit)
  const { feedbackTarget } = courseRealisation

  return (
    <Accordion
      sx={styles.accordion}
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
      data-cy="my-teaching-course-unit-item"
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} data-cy={`my-teaching-course-unit-accordion-${courseCode}`}>
        <Box>
          <Typography sx={{ mr: 2 }}>
            {visibleCourseCode} {getLanguageValue(name, i18n.language)}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <RenderFeedbackResponseChip courseRealisation={courseRealisation} code={courseCode} />
            {!courseUnit.userCreated && <RenderInterimFeedbackChip parentFeedbackTarget={feedbackTarget} />}
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
