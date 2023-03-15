import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Typography, Alert, Button } from '@mui/material'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import ResponseForm from './ResponseForm'
import useFeedbackTargetContinuousFeedbacks from '../../../../hooks/useFeedbackTargetContinuousFeedbacks'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { feedbackTargetIsOngoing } from './utils'
import Markdown from '../../../../components/common/Markdown'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import ErrorView from '../../../../components/common/ErrorView'
import ContinuousFeedbackSettings from './ContinuousFeedbackSettings'
import { OpenFeedbackContainer } from '../../../../components/OpenFeedback/OpenFeedback'
import CardSection from '../../../../components/common/CardSection'

const ResponseItem = ({ feedbackId, response, isTeacher, refetch }) => {
  const { t } = useTranslation()

  const [showEdit, setShowEdit] = useState(false)

  return (
    <Box ml="2rem">
      <OpenFeedbackContainer sx={{ mb: '1rem' }}>
        <Box width="100%">
          <Typography variant="body2">{t('feedbackTargetView:continuousFeedbackResponse')}</Typography>
          <Markdown>{response}</Markdown>
          {isTeacher && (
            <Box display="flex" justifyContent="flex-end" mt={-2}>
              <Button onClick={() => setShowEdit(!showEdit)}>{showEdit ? t('common:close') : t('common:edit')}</Button>
            </Box>
          )}
        </Box>
      </OpenFeedbackContainer>
      {showEdit && <ResponseForm feedbackId={feedbackId} setShow={setShowEdit} refetch={refetch} response={response} />}
    </Box>
  )
}

const FeedbackItem = ({ feedback, canRespond, refetch }) => {
  const { t } = useTranslation()

  const { id, createdAt, data, response } = feedback

  const [showResponse, setShowResponse] = useState(false)

  return (
    <Box mb="2rem">
      <OpenFeedbackContainer>
        <Box width="100%">
          <Markdown>{data}</Markdown>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" alignSelf="flex-end">
              {format(new Date(createdAt), 'dd.MM.yy HH.mm')}
            </Typography>
            {canRespond && !response && (
              <Button onClick={() => setShowResponse(!showResponse)}>
                {showResponse
                  ? t('feedbackTargetView:closeRespondContinuousFeedback')
                  : t('feedbackTargetView:respondContinuousFeedback')}
              </Button>
            )}
          </Box>
        </Box>
      </OpenFeedbackContainer>
      {response && <ResponseItem feedbackId={id} response={response} isTeacher={canRespond} refetch={refetch} />}
      {showResponse && <ResponseForm feedbackId={id} setShow={setShowResponse} refetch={refetch} />}
    </Box>
  )
}

const TeacherInfo = ({ enabled, hasFeedback }) => {
  const { t } = useTranslation()

  if (!enabled)
    return (
      <Alert mb={1} severity="warning">
        {t('feedbackTargetView:continuousFeedbackInactive')}
      </Alert>
    )

  if (!hasFeedback) return <Alert severity="info">{t('feedbackTargetView:noContinuousFeedbackGiven')}</Alert>

  return null
}

const ContinuousFeedbackList = ({ canRespond }) => {
  const { id } = useParams()
  const { continuousFeedbacks, isLoading, refetch } = useFeedbackTargetContinuousFeedbacks(id)

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!continuousFeedbacks) {
    return <ErrorView returnTo={`/targets/${id}`} />
  }

  const sortedFeedbacks = continuousFeedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <Box>
      {sortedFeedbacks.map(feedback => (
        <FeedbackItem key={feedback.id} feedback={feedback} canRespond={canRespond} refetch={refetch} />
      ))}
    </Box>
  )
}

const ContinuousFeedback = () => {
  const { id } = useParams()
  const { t } = useTranslation()

  const { feedbackTarget, isTeacher, isResponsibleTeacher, isAdmin, isOrganisationAdmin, isStudent } =
    useFeedbackTargetContext()

  const showSettings = isResponsibleTeacher || isAdmin || isOrganisationAdmin

  const isOngoing = feedbackTargetIsOngoing(feedbackTarget)

  const { continuousFeedbackEnabled, continuousFeedbackCount } = feedbackTarget

  const [feedbackEnabled, setFeedbackEnabled] = useState(continuousFeedbackEnabled)

  return (
    <Box>
      {showSettings && (
        <ContinuousFeedbackSettings
          feedbackTarget={feedbackTarget}
          feedbackEnabled={feedbackEnabled}
          setFeedbackEnabled={setFeedbackEnabled}
        />
      )}

      <Box my="1rem">
        <CardSection title={t('feedbackTargetView:continuousFeedbackGiven')}>
          {isStudent && (
            <Box mb={2}>
              <Alert severity="info">{t('feedbackTargetView:continuousFeedbackStudentInfo')}</Alert>
            </Box>
          )}

          {(isTeacher || isResponsibleTeacher) && (
            <Box mb={2}>
              <TeacherInfo enabled={feedbackEnabled} hasFeedback={continuousFeedbackCount > 0} />
            </Box>
          )}

          <ContinuousFeedbackList canRespond={isResponsibleTeacher} />

          {isStudent && isOngoing && (
            <Button color="primary" variant="contained" component={Link} to={`/targets/${id}/feedback`}>
              {t('userFeedbacks:giveContinuousFeedback')}
            </Button>
          )}
        </CardSection>
      </Box>
    </Box>
  )
}

export default ContinuousFeedback
