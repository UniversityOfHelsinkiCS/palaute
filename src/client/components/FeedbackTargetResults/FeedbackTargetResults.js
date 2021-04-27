import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  Typography,
  Box,
  CircularProgress,
  makeStyles,
} from '@material-ui/core'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useFeedbackTargetFeedbacks from '../../hooks/useFeedbackTargetFeedbacks'
import QuestionResults from '../QuestionResults'
import { getLanguageValue } from '../../util/languageUtils'

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
}))

const FeedbackTargetResults = () => {
  const { i18n } = useTranslation()
  const classes = useStyles()
  const { id } = useParams()

  const {
    feedbackTarget,
    isLoading: feedbackTargetIsLoading,
  } = useFeedbackTarget(id)

  const {
    feedbacks,
    isLoading: feedbacksIsLoading,
  } = useFeedbackTargetFeedbacks(id)

  const isLoading = feedbackTargetIsLoading || feedbacksIsLoading

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  if (!feedbackTarget || !feedbacks) {
    return <Redirect to="/" />
  }

  const { questions } = feedbackTarget

  const name = getLanguageValue(feedbackTarget.name, i18n.language)

  return (
    <>
      <Typography variant="h4" component="h1" className={classes.title}>
        {name}
      </Typography>
      <QuestionResults questions={questions} feedbacks={feedbacks} />
    </>
  )
}

export default FeedbackTargetResults
