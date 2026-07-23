import { Box } from '@mui/material'
import React from 'react'

const CourseUnitGroup = ({ children }) => (
  <Box
    sx={{
      marginTop: '4rem',
      padding: '1rem',
      borderTop: theme => `1px solid ${theme.palette.divider}`,
      borderRight: theme => `1px solid ${theme.palette.divider}`,
      borderLeft: theme => `1px solid ${theme.palette.divider}`,
      position: 'relative',
    }}
  >
    {children}
  </Box>
)

export default CourseUnitGroup
