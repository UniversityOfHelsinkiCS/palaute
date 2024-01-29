import React from 'react'

import { Typography } from '@mui/material'

const CourseGroupTitle = ({ title, badgeCount }) => (
  <Typography
    component="h2"
    sx={{
      marginTop: '-1.75em',
      paddingX: '0.5em',
      fontSize: '18px',
      fontWeight: theme => theme.typography.fontWeightMedium,
      position: 'absolute',
      backgroundColor: '#fff',
      width: 'full',
      zIndex: 1,
    }}
  >
    {title} ({badgeCount})
  </Typography>
)

export default CourseGroupTitle
