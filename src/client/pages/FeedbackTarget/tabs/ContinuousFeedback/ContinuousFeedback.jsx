import { keyframes } from '@emotion/react'
import { DeleteForever } from '@mui/icons-material'
import { Box, Typography, Alert, IconButton } from '@mui/material'
import { format } from 'date-fns'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import CardSection from '../../../../components/common/CardSection'
import ErrorView from '../../../../components/common/ErrorView'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import Markdown from '../../../../components/common/Markdown'
import { NorButton } from '../../../../components/common/NorButton'
import { OpenFeedbackContainer } from '../../../../components/OpenFeedback/OpenFeedback'
import useFeedbackTargetContinuousFeedbacks from '../../../../hooks/useFeedbackTargetContinuousFeedbacks'
import { focusIndicatorStyle } from '../../../../util/accessibility'
import { FEEDBACK_HIDDEN_STUDENT_COUNT } from '../../../../util/common'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import ContinuousFeedbackForm from './ContinuousFeedbackForm'
import ContinuousFeedbackSettings from './ContinuousFeedbackSettings'
import ResponseForm from './ResponseForm'
import useDeleteContinuousFeedback from './useDeleteContinuousFeedback'
import { feedbackTargetIsOngoing } from './utils'

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
`

const ResponseItem = ({ feedbackId, response, isTeacher, refetch }) => {
  const { t } = useTranslation()

  const [showEdit, setShowEdit] = useState(false)

  return (
    <Box sx={{ ml: '2rem' }}>
      <OpenFeedbackContainer sx={{ mb: '1rem' }}>
        <Box width="100%">
          <Typography variant="body2">{t('feedbackTargetView:continuousFeedbackResponse')}</Typography>
          <Markdown>{response}</Markdown>
          {isTeacher && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -2 }}>
              <NorButton color="secondary" onClick={() => setShowEdit(!showEdit)}>
                {showEdit ? t('common:close') : t('common:edit')}
              </NorButton>
            </Box>
          )}
        </Box>
      </OpenFeedbackContainer>
      {showEdit && <ResponseForm feedbackId={feedbackId} setShow={setShowEdit} refetch={refetch} response={response} />}
    </Box>
  )
}

const FeedbackItem = ({ feedback, canRespond, canDelete, deleteAnswer, refetch }) => {
  const { t } = useTranslation()

  const { id, createdAt, data, response } = feedback

  const [showResponse, setShowResponse] = useState(false)

  return (
    <Box sx={{ mb: '2rem', animation: `${slideDown} 0.2s ease-out` }}>
      <OpenFeedbackContainer>
        <Box sx={{ width: '100%' }}>
          <Markdown>{data}</Markdown>
          <Box sx={{ display: 'flex' }}>
            <Typography variant="body2" sx={{ mr: 'auto' }}>
              {format(new Date(createdAt), 'dd.MM.yy HH.mm')}
            </Typography>
            {canRespond && !response && (
              <NorButton onClick={() => setShowResponse(!showResponse)} data-cy="respondContinuousFeedback">
                {showResponse
                  ? t('feedbackTargetView:closeRespondContinuousFeedback')
                  : t('feedbackTargetView:respondContinuousFeedback')}
              </NorButton>
            )}
            {canDelete && (
              <IconButton
                aria-label={t('feedbackTargetResults:deletePermanently')}
                onClick={() => deleteAnswer(id)}
                size="small"
                sx={{ ml: 1, ...focusIndicatorStyle() }}
                disableRipple
              >
                <DeleteForever sx={{ fontSize: '12px' }} />
              </IconButton>
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
      <Alert severity="warning" sx={{ mb: 1 }}>
        {t('feedbackTargetView:continuousFeedbackInactive')}
      </Alert>
    )

  if (!hasFeedback) return <Alert severity="info">{t('feedbackTargetView:noContinuousFeedbackGiven')}</Alert>

  return null
}

const ContinuousFeedbackList = ({ canRespond }) => {
  const { id } = useParams()
  const { continuousFeedbacks, isLoading, refetch } = useFeedbackTargetContinuousFeedbacks(id)
  const { canDelete, deleteAnswer } = useDeleteContinuousFeedback()

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
        <FeedbackItem
          key={feedback.id}
          feedback={feedback}
          canRespond={canRespond}
          refetch={refetch}
          canDelete={canDelete}
          deleteAnswer={deleteAnswer}
        />
      ))}
    </Box>
  )
}

const SmallCourseInfo = ({ t }) => (
  <Box sx={{ marginTop: '16px', marginBottom: '40px' }}>
    <Alert severity="warning" data-cy="smallCourseInfo">
      {t('feedbackTargetResults:smallCourseInfo', { count: FEEDBACK_HIDDEN_STUDENT_COUNT })}
    </Alert>
  </Box>
)

const ContinuousFeedback = () => {
  const { t } = useTranslation()

  const { feedbackTarget, isTeacher, isResponsibleTeacher, isAdmin, isOrganisationAdmin, isStudent } =
    useFeedbackTargetContext()

  const { continuousFeedbacks } = useFeedbackTargetContinuousFeedbacks(feedbackTarget.id)

  const isOngoing = feedbackTargetIsOngoing(feedbackTarget)

  const isFeedbackEnabled = feedbackTarget.continuousFeedbackEnabled

  const showSettings = isResponsibleTeacher || isAdmin || isOrganisationAdmin
  const showFeedbackList = !!(
    isTeacher ||
    continuousFeedbacks?.length ||
    (isStudent && isFeedbackEnabled && !isOngoing)
  )

  const studentCount = feedbackTarget.summary?.data?.studentCount ?? 0
  const isSmallCourse = studentCount < FEEDBACK_HIDDEN_STUDENT_COUNT

  return (
    <Box id="feedback-target-tab-content">
      {showSettings && <ContinuousFeedbackSettings feedbackTarget={feedbackTarget} />}

      <Box sx={{ my: '1rem' }}>
        {isStudent && isOngoing && isFeedbackEnabled && (
          <CardSection title={t('userFeedbacks:giveContinuousFeedback')} sx={{ mb: 2 }}>
            <ContinuousFeedbackForm fewEnrolled={isSmallCourse} />
          </CardSection>
        )}
        {showFeedbackList && (
          <CardSection title={t('feedbackTargetView:continuousFeedbackGiven')}>
            {(isTeacher || isResponsibleTeacher) && (
              <Box sx={{ mb: 2 }}>
                <TeacherInfo enabled={isFeedbackEnabled} hasFeedback={continuousFeedbacks?.length > 0} />
              </Box>
            )}

            {(isResponsibleTeacher || isAdmin) && isSmallCourse && <SmallCourseInfo t={t} />}

            {isStudent && (
              <Box sx={{ mb: 4 }}>
                <Alert severity="info">
                  {!isOngoing && !continuousFeedbacks?.length
                    ? t('feedbackTargetView:noContinuousFeedbackGivenStudentClosed')
                    : t('feedbackTargetView:continuousFeedbackStudentInfo')}
                </Alert>
              </Box>
            )}

            {showFeedbackList && <ContinuousFeedbackList canRespond={isResponsibleTeacher} canDelete={isAdmin} />}
          </CardSection>
        )}
      </Box>
    </Box>
  )
}

export default ContinuousFeedback
