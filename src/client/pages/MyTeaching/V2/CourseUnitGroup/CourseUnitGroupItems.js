import React from 'react'

import { Divider, Grid } from '@mui/material'

import CourseUnitAccordion from '../CourseUnitAccordion'

const CourseUnitGroupItems = ({ courseUnits, status }) => (
  <Grid container spacing={2} columns={{ xs: 4, sm: 8 }}>
    {courseUnits.map(courseUnit => (
      <Grid item xs={4} sm={4} key={courseUnit.courseCode}>
        <CourseUnitAccordion courseUnit={courseUnit} group={status} />
        <Divider />
      </Grid>
    ))}
  </Grid>
)

export default CourseUnitGroupItems
