import React from 'react'

import { Grid } from '@mui/material'

const CourseUnitGroupGridColumn = ({ children }) => (
  <Grid container item direction="column" sm={12} md={6} lg={4}>
    {children}
  </Grid>
)

export default CourseUnitGroupGridColumn
