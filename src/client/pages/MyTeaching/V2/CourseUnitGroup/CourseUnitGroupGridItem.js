import React from 'react'

import { Grid, Divider } from '@mui/material'

const CourseUnitGroupGridItem = ({ children }) => (
  <Grid item xs={4}>
    {children}
    <Divider />
  </Grid>
)

export default CourseUnitGroupGridItem
