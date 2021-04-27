import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { TableRow, TableCell, Link } from '@material-ui/core'

const TeacherCourseListItem = ({ course }) => (
  <TableRow key={course.id}>
    <TableCell align="left">
      <Link component={RouterLink} to={`/courses/${course.courseCode}/targets`}>
        {course.name}
      </Link>
    </TableCell>
    <TableCell align="left">{course.courseCode}</TableCell>
  </TableRow>
)

export default TeacherCourseListItem
