import React from 'react'

import { Box } from '@mui/material'

const CourseUnitGroup = ({ children }) => (
  <Box
    sx={{
      marginTop: '4rem',
      padding: '1rem',
      borderTop: '1px solid #e0e0e0',
      borderRight: '1px solid #e0e0e0',
      borderLeft: '1px solid #e0e0e0',
      position: 'relative',
      '&:hover': {
        borderColor: theme => theme.palette.primary.main,
      },
    }}
  >
    {children}
  </Box>
)

export default CourseUnitGroup
