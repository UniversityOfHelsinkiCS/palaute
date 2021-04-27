import React, { useState } from 'react'

import { Typography, CircularProgress, makeStyles } from '@material-ui/core'

import { useTeacherCourses } from '../../util/queries'

import TeacherCourseList from './TeacherCourseList'
import { getRelevantCourses, getUniqueCourses } from './utils'

const useStyles = makeStyles((theme) => ({
  progressContainer: {
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
  old: {
    color: 'darkgray',
    cursor: 'pointer',
    marginTop: 10,
  },
}))

const TeacherView = () => {
  const [visible, toggleVisible] = useState(false)
  const courses = useTeacherCourses()
  const classes = useStyles()

  const uniqueCourses = getUniqueCourses(courses)

  const relevantCourses = getRelevantCourses(uniqueCourses, true)
  const oldCourses = getRelevantCourses(uniqueCourses, false)

  const handleClick = () => {
    toggleVisible(!visible)
  }

  if (courses.isLoading) {
    return (
      <div className={classes.progressContainer}>
        <CircularProgress />
      </div>
    )
  }

  return (
    <>
      {relevantCourses && relevantCourses.length > 0 ? (
        <TeacherCourseList courses={relevantCourses} />
      ) : (
        <Typography variant="h6" component="h6">
          No courses active
        </Typography>
      )}
      <Typography
        variant="subtitle1"
        component="p"
        onClick={handleClick}
        className={classes.old}
      >
        Old courses
      </Typography>
      {visible && <TeacherCourseList courses={oldCourses} />}
    </>
  )
}

export default TeacherView
