import React from 'react'

import { Box, Divider } from '@mui/material'
import Masonry from '@mui/lab/Masonry'

import CourseUnitAccordion from '../CourseUnitAccordion'

const CourseUnitGroupItems = ({ courseUnits, status }) => (
  <Masonry spacing={2} columns={{ xs: 1, sm: 2, md: 3 }}>
    {courseUnits.map(courseUnit => (
      <Box key={courseUnit.courseCode}>
        <CourseUnitAccordion courseUnit={courseUnit} group={status} />
        <Divider />
      </Box>
    ))}
  </Masonry>
)

export default CourseUnitGroupItems
