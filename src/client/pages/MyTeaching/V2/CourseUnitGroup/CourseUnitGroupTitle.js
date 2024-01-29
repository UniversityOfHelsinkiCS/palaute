import React from 'react'

import { Badge, Typography } from '@mui/material'

const CourseGroupTitle = ({ title, badgeContent }) => (
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
    {title}
    {badgeContent && (
      <Badge badgeContent={badgeContent} color="primary" sx={{ marginLeft: '1.5rem', marginRight: '1rem' }} />
    )}
  </Typography>
)

export default CourseGroupTitle
