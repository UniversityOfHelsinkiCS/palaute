import React, { useState } from 'react'
import { useParams, Redirect, Link } from 'react-router-dom'
import { Box, Paper, Typography, Alert, Button } from '@mui/material'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

import ResponseForm from './ResponseForm'
import useFeedbackTargetContinuousFeedbacks from '../../hooks/useFeedbackTargetContinuousFeedbacks'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { LoadingProgress } from '../common/LoadingProgress'
import { feedbackTargetIsOngoing } from './utils'
import Markdown from '../common/Markdown'

const ResponseItem = ({ feedbackId, response, isTeacher, refetch }) => {
  const { t } = useTranslation()

  const [showEdit, setShowEdit] = useState(false)

  return (
    <Box ml={2} mt={-1} mb={2}>
      <Paper>
        <Box padding={2} marginBottom={2}>
          <Typography variant="body2">
            {t('feedbackTargetView:continuousFeedbackResponse')}
          </Typography>
          <Markdown>{response}</Markdown>
          {isTeacher && (
            <Box display="flex" justifyContent="flex-end" mt={-2}>
              <Button onClick={() => setShowEdit(!showEdit)}>
                {showEdit
                  ? t('feedbackTargetView:closeRespondContinuousFeedback')
                  : t('feedbackTargetView:editContinuousFeedbackResponse')}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      {showEdit && (
        <ResponseForm
          feedbackId={feedbackId}
          setShow={setShowEdit}
          refetch={refetch}
          response={response}
        />
      )}
    </Box>
  )
}

const FeedbackItem = ({ feedback, isTeacher, refetch }) => {
  const { t } = useTranslation()

  const { id, createdAt, data, response } = feedback

  const [showResponse, setShowResponse] = useState(false)

  return (
    <Box>
      <Paper>
        <Box padding={2} marginBottom={2}>
          <Markdown>{data}</Markdown>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" alignSelf="flex-end">
              {format(new Date(createdAt), 'dd.MM.yy HH.mm')}
            </Typography>
            {isTeacher && !response && (
              <Button onClick={() => setShowResponse(!showResponse)}>
                {showResponse
                  ? t('feedbackTargetView:closeRespondContinuousFeedback')
                  : t('feedbackTargetView:respondContinuousFeedback')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      {response && (
        <ResponseItem
          feedbackId={id}
          response={response}
          isTeacher={isTeacher}
          refetch={refetch}
        />
      )}
      {showResponse && (
        <ResponseForm
          feedbackId={id}
          setShow={setShowResponse}
          refetch={refetch}
        />
      )}
    </Box>
  )
}

const FeedbackTargetContinuousFeedback = () => {
  const { id } = useParams()
  const { t } = useTranslation()

  const { continuousFeedbacks, isLoading, refetch } =
    useFeedbackTargetContinuousFeedbacks(id)

  const { feedbackTarget, isLoading: feedbackTargetIsLoading } =
    useFeedbackTarget(id)

  const { authorizedUser, isLoading: authorizedUserLoading } =
    useAuthorizedUser()

  if (isLoading || feedbackTargetIsLoading || authorizedUserLoading) {
    return <LoadingProgress />
  }

  const { accessStatus, continuousFeedbackEnabled } = feedbackTarget

  const isAdmin = authorizedUser?.isAdmin ?? false
  const isTeacher =
    accessStatus === 'RESPONSIBLE_TEACHER' ||
    accessStatus === 'TEACHER' ||
    isAdmin
  const isStudent = accessStatus === 'STUDENT'

  if (!continuousFeedbacks || (!isAdmin && !continuousFeedbackEnabled)) {
    return <Redirect to="/" />
  }

  const isOngoing = feedbackTargetIsOngoing(feedbackTarget)

  const sortedFeedbacks = continuousFeedbacks.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )

  return (
    <Box margin={3}>
      <Typography mb={1} textTransform="uppercase">
        {t('feedbackTargetView:continuousFeedbackGiven')}
      </Typography>

      {isStudent && (
        <Box mb={2}>
          <Alert severity="info">
            {t('feedbackTargetView:continuousFeedbackStudentInfo')}
          </Alert>
        </Box>
      )}

      {isTeacher && !sortedFeedbacks.length && (
        <Alert severity="info">
          {t('feedbackTargetView:noContinuousFeedbackGiven')}
        </Alert>
      )}

      {!!sortedFeedbacks.length &&
        sortedFeedbacks.map((feedback) => (
          <FeedbackItem
            key={feedback.id}
            feedback={feedback}
            isTeacher={isTeacher}
            refetch={refetch}
          />
        ))}

      {isStudent && isOngoing && (
        <Button
          color="primary"
          variant="contained"
          component={Link}
          to={`/targets/${id}/feedback`}
        >
          {t('userFeedbacks:giveContinuousFeedback')}
        </Button>
      )}
    </Box>
  )
}

export default FeedbackTargetContinuousFeedback
