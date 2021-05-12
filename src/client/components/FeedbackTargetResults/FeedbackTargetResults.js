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
import FeedbackSummary from '../QuestionResults/FeedbackSummary'
import QuestionResults from '../QuestionResults'
import { getLanguageValue } from '../../util/languageUtils'
import Alert from '../Alert'
import FeedbackResponse from './FeedbackResponse'

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
}))

const FeedbackTargetResults = () => {
  const { t, i18n } = useTranslation()
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

  const { questions, publicQuestionIds, accessStatus } = feedbackTarget

  const courseUnitName = getLanguageValue(
    feedbackTarget.courseUnit.name,
    i18n.language,
  )

  const isTeacher = accessStatus === 'TEACHER'

  const notEnoughFeedbacksAlert = (
    <Box mb={2}>
      <Alert severity="warning">
        {t('feedbackTargetResults:notEnoughFeedbacksInfo')}
      </Alert>
    </Box>
  )

  return (
    <>
      <Typography variant="h4" component="h1" className={classes.title}>
        {courseUnitName}
      </Typography>

      <Box mb={2}>
        <FeedbackResponse feedbackTarget={feedbackTarget} />
      </Box>

      {feedbacks.length === 0 && notEnoughFeedbacksAlert}

      {feedbacks.length !== 0 && (
        <FeedbackSummary
          publicQuestionIds={publicQuestionIds ?? []}
          questions={questions}
          feedbacks={feedbacks}
        />
      )}

      {feedbacks.length !== 0 && (
        <QuestionResults
          publicQuestionIds={publicQuestionIds ?? []}
          showPublicInfo={isTeacher}
          selectPublicQuestionsLink={`/targets/${feedbackTarget.id}/public-questions`}
          questions={questions}
          feedbacks={feedbacks}
          isTeacher={isTeacher}
        />
      )}
    </>
  )
}

export default FeedbackTargetResults
