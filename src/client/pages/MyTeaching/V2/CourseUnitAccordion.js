import React from 'react'
import { useTranslation } from 'react-i18next'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material'

import FeedbackTargetList from '../FeedbackTargetList'
import RenderInterimFeedbackChip from './chips/RenderInterimFeedbackChip'
import RenderFeedbackResponseChip from './chips/RenderFeedbackResponseChip'

import { getRelevantCourseRealisation } from '../utils'

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

  const courseRealisation = getRelevantCourseRealisation(courseUnit, group)
  const visibleCourseCode = getCourseCode(courseUnit)
  const { feedbackTarget } = courseRealisation

  // Check that the feedback target is not an interim feedback or a organisation survey
  const fetchInterimFeedbacks = !feedbackTarget.userCreated && !courseUnit.userCreated

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
            {fetchInterimFeedbacks && <RenderInterimFeedbackChip parentFeedbackTarget={feedbackTarget} />}
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
