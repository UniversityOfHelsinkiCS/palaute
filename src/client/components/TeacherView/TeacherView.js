import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Typography,
  CircularProgress,
  makeStyles,
  Box,
  Button,
} from '@material-ui/core'

import useTeacherCourseUnits from '../../hooks/useTeacherCourseUnits'
import TeacherCourseList from './TeacherCourseList'
import { getRelevantCourses, getUniqueCourses } from './utils'

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(2),
  },
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
  const { courseUnits, isLoading } = useTeacherCourseUnits()
  const classes = useStyles()
  const { t } = useTranslation()

  const uniqueCourses = getUniqueCourses(courseUnits)
  const relevantCourses = getRelevantCourses(uniqueCourses, true)
  const oldCourses = getRelevantCourses(uniqueCourses, false)

  const handleClick = () => {
    toggleVisible(!visible)
  }

  if (isLoading) {
    return (
      <div className={classes.progressContainer}>
        <CircularProgress />
      </div>
    )
  }

  return (
    <>
      <Typography variant="h4" component="h1" className={classes.heading}>
        {t('teacherView:mainHeading')}
      </Typography>
      {relevantCourses && relevantCourses.length > 0 ? (
        <TeacherCourseList courses={relevantCourses} />
      ) : (
        <Typography variant="h6" component="h6">
          {t('teacherView:noActiveCourses')}
        </Typography>
      )}
      <Box mt={2} mb={2}>
        <Button onClick={handleClick}>{t('teacherView:oldCourses')}</Button>
      </Box>
      {visible && <TeacherCourseList courses={oldCourses} />}
    </>
  )
}

export default TeacherView
