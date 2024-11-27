import React from 'react'

import { Grid2 as Grid } from '@mui/material'

const CourseUnitGroupGridColumn = ({ children }) => (
  <Grid container direction="column" size={{ sm: 12, md: 6, lg: 4 }}>
    {children}
  </Grid>
)

export default CourseUnitGroupGridColumn
