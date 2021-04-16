import React, { useMemo, Fragment } from 'react'
import { Typography, makeStyles } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import useFeedbackTargetsForStudent from '../../hooks/useFeedbackTargetsForStudent'
import CourseRealisationItem from './CourseRealisationItem'

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
  const { feedbackTargets } = useFeedbackTargetsForStudent()

  const courseRealisations = useMemo(
    () => getCourseRealisationsWithFeedbackTargets(feedbackTargets),
    [feedbackTargets],
  )

  const sortedCourseRealations = useMemo(
    () => sortCourseRealisations(courseRealisations),
    [courseRealisations],
  )

  if (!feedbackTargets) {
    return null
  }

  return (
    <div>
      <Typography variant="h4" className={classes.heading}>
        {t('userFeedbacks:mainHeading')}
      </Typography>

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
