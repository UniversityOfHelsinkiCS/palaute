import React from 'react'

import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../util/languageUtils'
import FeedbackTargetList from './FeedbackTargetList'
import { getRelevantCourseRealisation } from './utils'
import FeedbackResponseChip from './FeedbackResponseChip'
import feedbackTargetIsEnded from '../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../../util/feedbackTargetIsOpen'
import feedbackTargetIsOld from '../../../util/feedbackTargetIsOld'

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
  const isCurrent = !isEnded && !isOpen && !isOld
  const { id: feedbackTargetId, continuousFeedbackEnabled } = feedbackTarget || {}

  if (isOpen || (isCurrent && continuousFeedbackEnabled) || (feedbackCount > 0 && isEnded) || feedbackResponseGiven) {
    return (
      <FeedbackResponseChip
        id={feedbackTargetId}
        feedbackResponseGiven={feedbackResponseGiven}
        feedbackResponseSent={feedbackResponseSent || isOld}
        ongoing={isOpen}
        continuous={isCurrent && continuousFeedbackEnabled}
        data-cy={`feedbackResponseGiven-${code}-${feedbackResponseGiven}`}
      />
    )
  }

  return null
}

const CourseUnitAccordion = ({ courseUnit, group }) => {
  const { i18n } = useTranslation()

  const { name, courseCode } = courseUnit
  const courseRealisation = getRelevantCourseRealisation(courseUnit, group)
  const chip = getChip(courseRealisation, courseCode)

  return (
    <Accordion
      sx={styles.accordion}
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
      data-cy="courseUnitItem"
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} data-cy={`courseUnitAccordion-${courseCode}`}>
        <div>
          <Typography>
            {courseCode} {getLanguageValue(name, i18n.language)}
          </Typography>
          {chip}
        </div>
      </AccordionSummary>
      <AccordionDetails sx={styles.details}>
        <FeedbackTargetList courseCode={courseCode} group={group} />
      </AccordionDetails>
    </Accordion>
  )
}

export default CourseUnitAccordion
