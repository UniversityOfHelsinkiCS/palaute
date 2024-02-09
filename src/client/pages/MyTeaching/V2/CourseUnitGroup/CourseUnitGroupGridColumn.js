import React from 'react'

import { Grid } from '@mui/material'

const CourseUnitGroupGridColumn = ({ children }) => (
  <Grid container item direction="column" xs={12} sm={6} md={4}>
    {children}
  </Grid>
)

export default CourseUnitGroupGridColumn
