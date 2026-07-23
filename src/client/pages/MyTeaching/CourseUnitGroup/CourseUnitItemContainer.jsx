import { Paper } from '@mui/material'
import React from 'react'

const CourseUnitItemContainer = ({ children }) => (
  <Paper
    sx={{
      mt: '1rem',
      borderRadius: '0.5rem',
    }}
    elevation={1}
  >
    {children}
  </Paper>
)

export default CourseUnitItemContainer
