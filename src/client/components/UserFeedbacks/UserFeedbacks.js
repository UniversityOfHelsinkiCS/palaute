import React, { useMemo, Fragment } from 'react'
import { Typography, CircularProgress, makeStyles } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import qs from 'qs'

import useFeedbackTargetsForStudent from '../../hooks/useFeedbackTargetsForStudent'
import CourseRealisationItem from './CourseRealisationItem'
import Alert from '../Alert'
import StatusTabs from './StatusTabs'

import {
  filterFeedbackTargetsByStatus,
  getCourseRealisationsWithFeedbackTargets,
  sortCourseRealisations,
} from './utils'

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(2),
  },
  courseRealisationItem: {
    marginBottom: theme.spacing(2),
  },
  statusTabs: {
    marginBottom: theme.spacing(2),
  },
  progressContainer: {
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
}))

const UserFeedbacks = () => {
  const classes = useStyles()
  const location = useLocation()

  const { status = 'waitingForFeedback' } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })

  const { t } = useTranslation()
  const { feedbackTargets, isLoading } = useFeedbackTargetsForStudent()

  const filteredFeedbackTargets = useMemo(
    () => filterFeedbackTargetsByStatus(feedbackTargets, status),
    [feedbackTargets, status],
  )

  const courseRealisations = useMemo(
    () => getCourseRealisationsWithFeedbackTargets(filteredFeedbackTargets),
    [filteredFeedbackTargets],
  )

  const sortedCourseRealations = useMemo(
    () => sortCourseRealisations(courseRealisations),
    [courseRealisations],
  )

  const showNoFeedbackAlert = !isLoading && sortedCourseRealations.length === 0

  return (
    <div>
      <Typography variant="h4" component="h1" className={classes.heading}>
        {t('userFeedbacks:mainHeading')}
      </Typography>

      <StatusTabs className={classes.statusTabs} status={status} />

      {isLoading && (
        <div className={classes.progressContainer}>
          <CircularProgress />
        </div>
      )}

      {showNoFeedbackAlert && sortedCourseRealations.length === 0 && (
        <Alert severity="info">{t('userFeedbacks:noFeedback')}</Alert>
      )}

      {sortedCourseRealations.map((courseRealisation) => (
        <Fragment key={courseRealisation.id}>
          <CourseRealisationItem
            className={classes.courseRealisationItem}
            courseRealisation={courseRealisation}
          />
        </Fragment>
      ))}
    </div>
  )
}

export default UserFeedbacks
