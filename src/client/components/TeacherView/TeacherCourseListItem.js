import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { TableRow, TableCell, Link } from '@material-ui/core'
import { formatValidityPeriod } from './utils'

const TeacherCourseListItem = ({ course }) => {
  const parsedDates = formatValidityPeriod(course.validityPeriod)

  return (
    <TableRow key={course.id}>
      <TableCell align="left">
        <Link
          component={RouterLink}
          to={`/courses/${course.courseCode}/targets`}
        >
          {course.name}
        </Link>
      </TableCell>
      <TableCell align="left">{course.courseCode}</TableCell>
      <TableCell align="left">{parsedDates.startDate}</TableCell>
      <TableCell align="left">{parsedDates.endDate}</TableCell>
    </TableRow>
  )
}

export default TeacherCourseListItem
