import React from 'react'

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  makeStyles,
} from '@material-ui/core'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import FeedbackTargetList from './FeedbackTargetList'
import { getRelevantCourseRealisation } from './utils'
import FeedbackResponseChip from './FeedbackResponseChip'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import FeedbackOpenChip from './FeedbackOpenChip'

const useStyles = makeStyles({
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
})

const getChip = (courseRealisation) => {
  const { feedbackResponseGiven, feedbackTarget } = courseRealisation
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)

  if (isEnded || feedbackResponseGiven) {
    return (
      <FeedbackResponseChip feedbackResponseGiven={feedbackResponseGiven} />
    )
  }

  if (isOpen) {
    return <FeedbackOpenChip />
  }

  return null
}

const CourseUnitAccordion = ({ courseUnit, group }) => {
  const { i18n } = useTranslation()
  const classes = useStyles()

  const { name, courseCode } = courseUnit
  const courseRealisation = getRelevantCourseRealisation(courseUnit, group)
  const chip = getChip(courseRealisation)

  return (
    <Accordion
      className={classes.accordion}
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
      data-cy="courseUnitItem"
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div>
          <Typography>
            {courseCode} {getLanguageValue(name, i18n.language)}
          </Typography>
          {chip}
        </div>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        <FeedbackTargetList courseCode={courseCode} group={group} />
      </AccordionDetails>
    </Accordion>
  )
}

export default CourseUnitAccordion
