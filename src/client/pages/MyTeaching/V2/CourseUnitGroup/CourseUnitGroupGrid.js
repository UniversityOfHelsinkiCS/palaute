import React from 'react'

import { Grid } from '@mui/material'

const CourseUnitGroupGrid = ({ children }) => (
  <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>
    {children}
  </Grid>
)

export default CourseUnitGroupGrid
