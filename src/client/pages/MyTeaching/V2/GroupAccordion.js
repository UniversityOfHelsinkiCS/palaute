import React from 'react'

import { Typography, Box, Divider } from '@mui/material'
import Masonry from '@mui/lab/Masonry'

import { useTranslation } from 'react-i18next'

import CourseUnitAccordion from './CourseUnitAccordion'

const styles = {
  wrapper: {
    marginTop: '4rem',
    padding: '1rem',
    borderTop: '1px solid #e0e0e0',
    borderRight: '1px solid #e0e0e0',
    borderLeft: '1px solid #e0e0e0',
    position: 'relative',
    '&:hover': {
      borderColor: theme => theme.palette.primary.main,
    },
  },
  title: {
    marginTop: '-1.75em',
    paddingX: '0.5em',
    fontSize: '18px',
    fontWeight: theme => theme.typography.fontWeightMedium,
    position: 'absolute',
    backgroundColor: '#fff',
    width: 'full',
    zIndex: 1,
  },
  details: {
    flexDirection: 'column',
    padding: 0,
  },
}

const GroupAccordion = ({ title, courseUnits, group }) => {
  const { t } = useTranslation()

  return (
    <Box sx={styles.wrapper}>
      <Typography component="h2" sx={styles.title}>
        Yliopistokurssit ({courseUnits.length})
      </Typography>

      <Box sx={styles.details}>
        <Masonry spacing={2} columns={{ xs: 1, sm: 2, md: 3 }}>
          {courseUnits.map((courseUnit, i) => (
            <Box key={courseUnit.courseCode}>
              <CourseUnitAccordion courseUnit={courseUnit} group={group} />
              <Divider />
            </Box>
          ))}
        </Masonry>
      </Box>
    </Box>
  )
}

export default GroupAccordion
