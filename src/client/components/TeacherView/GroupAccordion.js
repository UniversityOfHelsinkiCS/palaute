import React, { Fragment } from 'react'

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Divider,
} from '@mui/material'
import { makeStyles } from '@mui/styles'

import { useTranslation } from 'react-i18next'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import CourseUnitAccordion from './CourseUnitAccordion'

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
