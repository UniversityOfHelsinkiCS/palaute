import React from 'react'

import { Typography, Box } from '@mui/material'

import { useTranslation } from 'react-i18next'

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

const CourseGroup = ({ title, courseUnits, children }) => {
  const { t } = useTranslation()

  return (
    <Box sx={styles.wrapper}>
      <Typography component="h2" sx={styles.title}>
        Yliopistokurssit ({courseUnits.length})
      </Typography>

      <Box sx={styles.details}>{children}</Box>
    </Box>
  )
}

export default CourseGroup
