import React from 'react'

import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material'
import Masonry from '@mui/lab/Masonry'

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
        <Masonry spacing={2} columns={{ xs: 1, sm: 2, md: 3 }}>
          {courseUnits.map(courseUnit => (
            <Box key={courseUnit.courseCode}>
              <CourseUnitAccordion courseUnit={courseUnit} group={group} />
            </Box>
          ))}
        </Masonry>
      </AccordionDetails>
    </Accordion>
  )
}

export default GroupAccordion
