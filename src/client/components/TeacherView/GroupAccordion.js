import React from 'react'

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  makeStyles,
  Box,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import CourseUnitItem from './CourseUnitAccordion'

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: '1.1rem',
    fontWeight: theme.typography.fontWeightMedium,
  },
  details: {
    flexDirection: 'column',
    padding: 0,
  },
  icon: {
    marginRight: theme.spacing(1),
  },
}))

const GroupAccordion = ({ title, courseUnits, icon, group }) => {
  const classes = useStyles()
  const { t } = useTranslation()

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <span className={classes.icon}>{icon}</span>
        <Typography className={classes.title}>
          {title} ({courseUnits.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        {courseUnits.length === 0 && (
          <Box p={2}>
            <Typography color="textSecondary" align="center">
              {t('teacherView:noCourses')}
            </Typography>
          </Box>
        )}
        {courseUnits.map((courseUnit) => (
          <CourseUnitItem
            key={courseUnit.courseCode}
            courseUnit={courseUnit}
            group={group}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  )
}

export default GroupAccordion
