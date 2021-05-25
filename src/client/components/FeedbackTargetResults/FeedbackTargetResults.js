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
import { ExportCsvLink, formatCourseDate } from './utils'

const useStyles = makeStyles((theme) => ({
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
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

  const courseName = getLanguageValue(
    feedbackTarget.courseRealisation.name,
    i18n.language,
  )

  const courseDate =
    feedbackTarget && formatCourseDate(feedbackTarget.courseRealisation)

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
      <Box mb={1} className={classes.topRow}>
        <div>
          <Typography variant="h4" component="h1">
            {courseName}
          </Typography>
          <Typography variant="body1" component="p">
            {courseDate}
          </Typography>
        </div>
        {feedbacks.length === 0 && isTeacher && (
          <ExportCsvLink
            feedbackTarget={feedbackTarget}
            feedbacks={feedbacks}
          />
        )}
      </Box>

      <Box mb={2}>
        <FeedbackResponse feedbackTarget={feedbackTarget} />
      </Box>

      {feedbacks.length === 0 && notEnoughFeedbacksAlert}

      {feedbacks.length !== 0 && (
        <FeedbackSummary
          publicQuestionIds={publicQuestionIds ?? []}
          questions={questions}
          feedbacks={feedbacks}
          isTeacher={isTeacher}
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
