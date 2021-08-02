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

const getFeedbackResponseChip = (courseRealisation) => {
  const { feedbackResponseGiven, feedbackTarget } = courseRealisation
  const isEnded = feedbackTargetIsEnded(feedbackTarget)

  const showChip = isEnded || feedbackResponseGiven

  if (!showChip) {
    return null
  }

  return <FeedbackResponseChip feedbackResponseGiven={feedbackResponseGiven} />
}

const CourseUnitAccordion = ({ courseUnit, group }) => {
  const { i18n } = useTranslation()
  const classes = useStyles()

  const { name, courseCode } = courseUnit
  const courseRealisation = getRelevantCourseRealisation(courseUnit, group)
  const feedbackResponseChip = getFeedbackResponseChip(courseRealisation)

  return (
    <Accordion
      className={classes.accordion}
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div>
          <Typography>
            {courseCode} {getLanguageValue(name, i18n.language)}
          </Typography>
          {feedbackResponseChip}
        </div>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        <FeedbackTargetList courseCode={courseCode} group={group} />
      </AccordionDetails>
    </Accordion>
  )
}

export default CourseUnitAccordion
