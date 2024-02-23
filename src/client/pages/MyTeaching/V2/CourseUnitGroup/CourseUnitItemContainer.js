import React from 'react'
import { Paper } from '@mui/material'

const CourseUnitItemContainer = ({ children }) => (
  <Paper
    sx={{
      mt: '1rem',
      borderRadius: '0.5rem',
      // p: "1rem",
    }}
    elevation={1}
  >
    {children}
  </Paper>
)

export default CourseUnitItemContainer
