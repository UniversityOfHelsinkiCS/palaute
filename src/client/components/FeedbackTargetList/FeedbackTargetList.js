import React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import {
  Typography,
  List,
  Box,
  CircularProgress,
  makeStyles,
} from '@material-ui/core'

import CourseRealisationItem from './CourseRealisationItem'

import useCourseUnitFeedbackTargets from '../../hooks/useCourseUnitFeedbackTargets'
import { getLanguageValue } from '../../util/languageUtils'
import { getCourseRealisationsWithFeedbackTargets } from './utils'

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
  const { i18n } = useTranslation()

  const {
    feedbackTargets,
    isLoading: feedbackTargetsIsLoading,
  } = useCourseUnitFeedbackTargets(code)
  const isLoading = feedbackTargetsIsLoading

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    )
  }

  const courseUnit = feedbackTargets[0]?.courseUnit

  const name = getLanguageValue(courseUnit?.name, i18n.language)

  const courseRealisations = getCourseRealisationsWithFeedbackTargets(
    feedbackTargets,
  )

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
