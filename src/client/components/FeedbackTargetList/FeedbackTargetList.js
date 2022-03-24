import React from 'react'
import { useParams, Redirect } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Typography, List, Box, makeStyles } from '@material-ui/core'

import CourseRealisationItem from './CourseRealisationItem'

import useCourseUnitFeedbackTargets from '../../hooks/useCourseUnitFeedbackTargets'
import { getLanguageValue } from '../../util/languageUtils'
import { getCourseRealisationsWithFeedbackTargets } from './utils'
import { LoadingProgress } from '../LoadingProgress'

const useStyles = makeStyles((theme) => ({
  courseRealisationItem: {
    '&:not(:last-child)': {
      marginBottom: theme.spacing(2),
    },
  },
  title: {
    marginBottom: theme.spacing(2),
  },
}))

const FeedbackTargetList = () => {
  const classes = useStyles()
  const { code } = useParams()
  const { i18n, t } = useTranslation()

  const { feedbackTargets, isLoading: feedbackTargetsIsLoading } =
    useCourseUnitFeedbackTargets(code)
  const isLoading = feedbackTargetsIsLoading

  if (isLoading) {
    return <LoadingProgress />
  }

  if (feedbackTargets.length === 0) {
    return <Redirect to="/courses" />
  }

  const { courseUnit } = feedbackTargets[0]

  const name = getLanguageValue(courseUnit?.name, i18n.language)

  const courseRealisations =
    getCourseRealisationsWithFeedbackTargets(feedbackTargets)

  if (courseRealisations.length === 0) {
    return (
      <div>
        <Typography variant="h4" component="h1" className={classes.title}>
          {name}
        </Typography>
        <Typography variant="subtitle1">
          {t('feedbackTargetList:noCourseRealisations')}
        </Typography>
      </div>
    )
  }

  return (
    <div>
      <Typography variant="h4" component="h1" className={classes.title}>
        {name}
      </Typography>
      <List>
        {courseRealisations.map((courseRealisation) => (
          <CourseRealisationItem
            key={courseRealisation.id}
            courseRealisation={courseRealisation}
            className={classes.courseRealisationItem}
          />
        ))}
      </List>
    </div>
  )
}

export default FeedbackTargetList
