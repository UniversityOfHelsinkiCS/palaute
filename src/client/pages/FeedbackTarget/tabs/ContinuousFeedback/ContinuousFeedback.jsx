import { keyframes } from '@emotion/react'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Typography, Alert, IconButton } from '@mui/material'
import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import ErrorView from '../../../../components/common/ErrorView'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import Markdown from '../../../../components/common/Markdown'
import { NorButton } from '../../../../components/common/NorButton'
import Section from '../../../../components/common/Section'
import { OpenFeedbackContainer } from '../../../../components/OpenFeedback/OpenFeedback'
import useAuthorizedUser from '../../../../hooks/useAuthorizedUser'
import useFeedbackTargetContinuousFeedbacks from '../../../../hooks/useFeedbackTargetContinuousFeedbacks'
import { focusIndicatorStyle } from '../../../../util/accessibility'
import { FEEDBACK_HIDDEN_STUDENT_COUNT } from '../../../../util/common'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import ContinuousFeedbackForm from './ContinuousFeedbackForm'
import ContinuousFeedbackSettings from './ContinuousFeedbackSettings'
import EditFeedbackForm from './EditFeedbackForm'
import ResponseForm from './ResponseForm'
import useDeleteContinuousFeedback from './useDeleteContinuousFeedback'
import { feedbackTargetIsOngoing } from './utils'

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
`

const ResponseItem = ({
  feedbackId,
  response,
  isTeacher,
  refetch,
  mayBeOutdated,
  onSaved,
  focusEditButton,
  onEditButtonFocused,
}) => {
  const { t } = useTranslation()

  const [showEdit, setShowEdit] = useState(false)
  const editButtonRef = useRef(null)

  // A new response was just saved and its form removed, so focus moves to the Edit button of the response.
  // The request is cleared once done so that the button doesn't take focus again if it remounts later.
  useEffect(() => {
    if (!focusEditButton) return
    editButtonRef.current?.focus()
    onEditButtonFocused()
  }, [focusEditButton, onEditButtonFocused])

  const handleSaved = result => {
    editButtonRef.current?.focus()
    onSaved?.(result)
  }

  return (
    <Box sx={{ ml: '2rem' }}>
      {mayBeOutdated && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          {t('feedbackTargetView:continuousFeedbackEditedWhileResponding')}
        </Alert>
      )}
      <OpenFeedbackContainer sx={{ mb: '1rem' }}>
        <Box width="100%">
          <Typography variant="body2">{t('feedbackTargetView:continuousFeedbackResponse')}</Typography>
          <Markdown>{response}</Markdown>
          {isTeacher && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -2 }}>
              <NorButton ref={editButtonRef} color="secondary" onClick={() => setShowEdit(!showEdit)}>
                {showEdit ? t('common:close') : t('common:edit')}
              </NorButton>
            </Box>
          )}
        </Box>
      </OpenFeedbackContainer>
      {showEdit && (
        <ResponseForm
          feedbackId={feedbackId}
          setShow={setShowEdit}
          refetch={refetch}
          response={response}
          onSaved={handleSaved}
        />
      )}
    </Box>
  )
}

const FeedbackItem = ({
  feedback,
  canRespond,
  canEdit,
  canDelete,
  deleteAnswer,
  refetch,
  focusEditButton,
  newFeedbackInputRef,
}) => {
  const { t } = useTranslation()

  const { id, createdAt, data, response } = feedback

  const [showResponse, setShowResponse] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  // Set when the student edited the feedback while the teacher was writing a response to it.
  const [responseMayBeOutdated, setResponseMayBeOutdated] = useState(false)
  const [focusResponseEditButton, setFocusResponseEditButton] = useState(false)
  const editButtonRef = useRef(null)
  const wasEditing = useRef(false)

  useEffect(() => {
    if (wasEditing.current && !isEditing) (editButtonRef.current ?? newFeedbackInputRef?.current)?.focus()
    wasEditing.current = isEditing
  }, [isEditing, newFeedbackInputRef])

  const date = format(new Date(createdAt), 'dd.MM.yy HH.mm')

  return (
    <Box sx={{ mb: '2rem', animation: `${slideDown} 0.2s ease-out` }}>
      <OpenFeedbackContainer>
        <Box sx={{ width: '100%' }}>
          {isEditing ? (
            <EditFeedbackForm feedbackId={id} feedback={data} onClose={() => setIsEditing(false)} refetch={refetch} />
          ) : (
            <Markdown>{data}</Markdown>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 'auto' }}>
              {date}
            </Typography>
            {canEdit && !isEditing && (
              <NorButton
                ref={editButtonRef}
                // The student just sent this feedback, so focus is moved to the edit button to help the user find the saved feedback
                // oxlint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={focusEditButton}
                color="secondary"
                icon={<EditIcon aria-hidden />}
                aria-label={t('feedbackTargetView:editContinuousFeedbackLabel', { date })}
                onClick={() => setIsEditing(true)}
                data-cy="editContinuousFeedback"
              >
                {t('common:edit')}
              </NorButton>
            )}
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
                <DeleteForeverIcon sx={{ fontSize: '12px' }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </OpenFeedbackContainer>
      {response && (
        <ResponseItem
          feedbackId={id}
          response={response}
          isTeacher={canRespond}
          refetch={refetch}
          mayBeOutdated={responseMayBeOutdated}
          onSaved={() => setResponseMayBeOutdated(false)}
          focusEditButton={focusResponseEditButton}
          onEditButtonFocused={() => setFocusResponseEditButton(false)}
        />
      )}
      {showResponse && (
        <ResponseForm
          feedbackId={id}
          setShow={setShowResponse}
          refetch={refetch}
          feedbackText={data}
          onSaved={({ feedbackChanged }) => {
            setResponseMayBeOutdated(feedbackChanged)
            setFocusResponseEditButton(true)
          }}
        />
      )}
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

const ContinuousFeedbackList = ({ canRespond, canGiveFeedback, focusFeedbackId, newFeedbackInputRef }) => {
  const { id } = useParams()
  const { continuousFeedbacks, isLoading, refetch } = useFeedbackTargetContinuousFeedbacks(id)
  const { canDelete, deleteAnswer } = useDeleteContinuousFeedback()
  const { authorizedUser } = useAuthorizedUser()

  const canEdit = feedback => canGiveFeedback && feedback.userId === authorizedUser?.id && !feedback.response

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
          canEdit={canEdit(feedback)}
          focusEditButton={feedback.id === focusFeedbackId}
          newFeedbackInputRef={newFeedbackInputRef}
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
  const [focusFeedbackId, setFocusFeedbackId] = useState(null)
  const newFeedbackInputRef = useRef(null)

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
    <Box id="feedback-target-tab-content" sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {showSettings && <ContinuousFeedbackSettings feedbackTarget={feedbackTarget} />}

      {isStudent && isOngoing && isFeedbackEnabled && (
        <Section title={t('userFeedbacks:giveContinuousFeedback')}>
          <ContinuousFeedbackForm
            fewEnrolled={isSmallCourse}
            onSubmitted={setFocusFeedbackId}
            inputRef={newFeedbackInputRef}
          />
        </Section>
      )}
      {showFeedbackList && (
        <Section title={t('feedbackTargetView:continuousFeedbackGiven')}>
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
                  : isOngoing && isFeedbackEnabled
                    ? t('feedbackTargetView:continuousFeedbackStudentInfo')
                    : t('feedbackTargetView:continuousFeedbackStudentInfoClosed')}
              </Alert>
            </Box>
          )}

          {showFeedbackList && (
            <ContinuousFeedbackList
              canRespond={isResponsibleTeacher}
              canGiveFeedback={isStudent && isOngoing && isFeedbackEnabled}
              canDelete={isAdmin}
              focusFeedbackId={focusFeedbackId}
              newFeedbackInputRef={newFeedbackInputRef}
            />
          )}
        </Section>
      )}
    </Box>
  )
}

export default ContinuousFeedback
