import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { parseISO } from 'date-fns'
import {
  TableRow,
  TableCell,
  Link,
  Tooltip,
  makeStyles,
} from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import ClearIcon from '@material-ui/icons/Clear'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'

import { formatValidityPeriod } from './utils'

const useStyles = makeStyles(() => ({
  doneIcon: {
    color: '#4dc04e',
  },
  clearIcon: {
    color: '#eb4841',
  },
  accessTime: {
    color: '#f5a223',
  },
  hourglassIcon: {
    color: '#5c5cf5',
  },
}))

const TeacherCourseListItem = ({ course }) => {
  const parsedDates = formatValidityPeriod(course.activityPeriod)

  const classes = useStyles()

  const { t } = useTranslation()

  const feedbackResponseGivenContent = (course) => {
    if (parseISO(course.activityPeriod.endDate) > new Date()) {
      return (
        <Tooltip title={t('courseSummary:courseOngoing')}>
          <HourglassEmptyIcon className={classes.hourglassIcon} />
        </Tooltip>
      )
    }

    if (!course.feedbackResponseGiven) {
      if (
        new Date() > parseISO(course.closesAt) &&
        new Date() > parseISO(course.activityPeriod.endDate)
      ) {
        return (
          <Tooltip title={t('courseSummary:feedbackResponseNotGiven')}>
            <ClearIcon className={classes.clearIcon} />
          </Tooltip>
        )
      }
      return (
        <Tooltip title={t('courseSummary:feedbackStillOpen')}>
          <AccessTimeIcon className={classes.accessTime} />
        </Tooltip>
      )
    }
    return (
      <Tooltip title={t('courseSummary:feedbackResponseGiven')}>
        <DoneIcon className={classes.doneIcon} />
      </Tooltip>
    )
  }

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
      <TableCell align="center">
        {feedbackResponseGivenContent(course)}
      </TableCell>
    </TableRow>
  )
}

export default TeacherCourseListItem
