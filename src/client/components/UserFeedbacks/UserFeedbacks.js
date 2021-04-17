import React, { useMemo, Fragment } from 'react'
import { Typography, makeStyles } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import useFeedbackTargetsForStudent from '../../hooks/useFeedbackTargetsForStudent'
import CourseRealisationItem from './CourseRealisationItem'
import Alert from '../Alert'

import {
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
}))

const UserFeedbacks = () => {
  const classes = useStyles()
  const { t } = useTranslation()
  const { feedbackTargets, isLoading } = useFeedbackTargetsForStudent()

  const courseRealisations = useMemo(
    () => getCourseRealisationsWithFeedbackTargets(feedbackTargets),
    [feedbackTargets],
  )

  const sortedCourseRealations = useMemo(
    () => sortCourseRealisations(courseRealisations),
    [courseRealisations],
  )

  const showNoFeedbackAlert = !isLoading && sortedCourseRealations.length === 0

  return (
    <div>
      <Typography variant="h4" className={classes.heading}>
        {t('userFeedbacks:mainHeading')}
      </Typography>

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
