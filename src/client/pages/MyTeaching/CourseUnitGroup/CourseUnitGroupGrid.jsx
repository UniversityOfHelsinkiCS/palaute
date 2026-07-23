import { Grid2 as Grid } from '@mui/material'
import React from 'react'

const CourseUnitGroupGrid = ({ children }) => (
  <Grid container spacing={2}>
    {children}
  </Grid>
)

export default CourseUnitGroupGrid
