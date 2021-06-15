import React from 'react'

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Divider,
  makeStyles,
} from '@material-ui/core'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import FeedbackTargetList from './FeedbackTargetList'
import { getRelevantCourseRealisation, formatDate } from './utils'
import FeedbackResponseChip from './FeedbackResponseChip'

const useStyles = makeStyles({
  accordion: {
    boxShadow: 'none',
  },
  details: {
    display: 'block',
    padding: 0,
  },
})

const getDateRange = (courseRealisation) => {
  const { startDate, endDate } = courseRealisation

  return `${formatDate(startDate)} - ${formatDate(endDate)} `
}

const getFeedbackResponseChip = (courseRealisation, group) => {
  const { feedbackResponseGiven } = courseRealisation

  const showChip = group === 'ENDED' || feedbackResponseGiven

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
  const feedbackResponseChip = getFeedbackResponseChip(courseRealisation, group)

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
          <Typography variant="body2" color="textSecondary" component="span">
            {getDateRange(courseRealisation)}
          </Typography>
          {feedbackResponseChip}
        </div>
      </AccordionSummary>
      <Divider />
      <AccordionDetails className={classes.details}>
        <FeedbackTargetList courseCode={courseCode} group={group} />
      </AccordionDetails>
    </Accordion>
  )
}

export default CourseUnitAccordion
