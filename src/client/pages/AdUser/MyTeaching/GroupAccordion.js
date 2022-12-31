import React, { Fragment } from 'react'

import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Divider } from '@mui/material'

import { useTranslation } from 'react-i18next'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import CourseUnitAccordion from './CourseUnitAccordion'

const styles = {
  title: {
    fontSize: '1.1rem',
    fontWeight: theme => theme.typography.fontWeightMedium,
  },
  details: {
    flexDirection: 'column',
    padding: 0,
  },
  icon: {
    marginRight: theme => theme.spacing(1),
  },
}

const GroupAccordion = ({ title, courseUnits, icon, group }) => {
  const { t } = useTranslation()

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={styles.icon}>{icon}</Box>
        <Typography sx={styles.title}>
          {title} ({courseUnits.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={styles.details}>
        {courseUnits.length === 0 && (
          <Box p={2}>
            <Typography color="textSecondary" align="center">
              {t('teacherView:noCourses')}
            </Typography>
          </Box>
        )}
        {courseUnits.map((courseUnit, i) => (
          <Fragment key={courseUnit.courseCode}>
            <CourseUnitAccordion courseUnit={courseUnit} group={group} />
            {i < courseUnits.length - 1 && <Divider />}
          </Fragment>
        ))}
      </AccordionDetails>
    </Accordion>
  )
}

export default GroupAccordion
