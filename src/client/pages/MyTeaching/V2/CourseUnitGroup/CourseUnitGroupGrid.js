import React from 'react'

import { Grid } from '@mui/material'

const CourseUnitGroupGrid = ({ children }) => (
  <Grid container spacing={2}>
    {children}
  </Grid>
)

export default CourseUnitGroupGrid
