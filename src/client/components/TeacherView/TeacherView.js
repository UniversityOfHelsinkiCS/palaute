import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Typography, makeStyles } from '@material-ui/core'

import { useTeacherCourses } from '../../util/queries'

import TeacherCourseList from './TeacherCourseList'

const useStyles = makeStyles(() => ({
  rowComponent: {
    margin: 5,
  },
}))

const TeacherView = () => {
  const { t } = useTranslation()

  const classes = useStyles()
  const [sortedBy, useSortedBy] = useState({ sortBy: 'NAME', reversed: false })

  const courses = useTeacherCourses()

  if (!courses.data) return null

  courses.data.sort((a, b) =>
    a.validityPeriod.endDate < b.validityPeriod.endDate ? 1 : -1,
  )

  const codes = new Set()

  const uniqueCourses = []

  courses.data.forEach((course) => {
    if (codes.has(course.courseCode)) return
    uniqueCourses.push(course)
    codes.add(course.courseCode)
  })

  uniqueCourses.sort((a, b) => (a.courseCode < b.courseCode ? -1 : 1))

  const handleClick = (e, sortBy) => {
    e.preventDefault()
    if (sortedBy.sortBy === sortBy) {
      useSortedBy({ ...sortedBy, reversed: !sortedBy.reversed })
    } else {
      useSortedBy({ sortBy, reversed: false })
    }
  }

  return (
    <>
      <Typography
        variant="span"
        component="span"
        className={classes.rowComponent}
      >
        {t('teacherView:sortBy')}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="small"
        className={classes.rowComponent}
        onClick={(e) => handleClick(e, 'NAME')}
      >
        {`Name ${sortedBy.sortBy === 'NAME' && sortedBy.reversed ? '⇩' : '⇧'}`}
      </Button>
      <Button
        variant="contained"
        color="primary"
        size="small"
        className={classes.rowComponent}
        onClick={(e) => handleClick(e, 'CODE')}
      >
        {`Course code ${
          sortedBy.sortBy === 'CODE' && sortedBy.reversed ? '⇩' : '⇧'
        }`}
      </Button>
      <TeacherCourseList courses={uniqueCourses} sortedBy={sortedBy} />
    </>
  )
}

export default TeacherView
