import React from 'react'

import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Grid } from '@mui/material'

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
    <Accordion defaultExpanded sx={{ padding: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={styles.icon}>{icon}</Box>
        <Typography component="h2" variant="h5" sx={styles.title}>
          Yliopistokurssit ({courseUnits.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={styles.details}>
        <Grid spacing={2} container>
          {courseUnits.map((courseUnit, i) => (
            <Grid key={courseUnit.courseCode} xs={12} sm={6} md={4} item>
              <CourseUnitAccordion courseUnit={courseUnit} group={group} />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}

export default GroupAccordion
