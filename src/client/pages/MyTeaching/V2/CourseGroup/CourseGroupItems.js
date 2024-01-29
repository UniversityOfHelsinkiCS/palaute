import React from 'react'

import { Box, Divider } from '@mui/material'
import Masonry from '@mui/lab/Masonry'

import CourseUnitAccordion from '../CourseUnitAccordion'

const CourseGroupItems = ({ courseUnits, group }) => (
  <Masonry spacing={2} columns={{ xs: 1, sm: 2, md: 3 }}>
    {courseUnits.map(courseUnit => (
      <Box key={courseUnit.courseCode}>
        <CourseUnitAccordion courseUnit={courseUnit} group={group} />
        <Divider />
      </Box>
    ))}
  </Masonry>
)

export default CourseGroupItems
