import React from 'react'

import { Box } from '@mui/material'

const CourseUnitGroup = ({ children }) => (
  <Box
    sx={{
      marginTop: '4rem',
      padding: '1rem',
      borderTop: theme => `1px solid ${theme.palette.primary.light}`,
      borderRight: theme => `1px solid ${theme.palette.primary.light}`,
      borderLeft: theme => `1px solid ${theme.palette.primary.light}`,
      position: 'relative',
      '&:hover': {
        borderColor: theme => theme.palette.primary.dark,
      },
    }}
  >
    {children}
  </Box>
)

export default CourseUnitGroup
