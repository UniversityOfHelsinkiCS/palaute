import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import { Alert, Card, CardContent, Box, Button, Typography, Chip } from '@mui/material'

import { Link, useParams, useHistory } from 'react-router-dom'

import useAuthorizedUser from '../../../../hooks/useAuthorizedUser'
import useInteractiveMutation from '../../../../hooks/useInteractiveMutation'

import { LoadingProgress } from '../../../../components/common/LoadingProgress'

import PercentageCell from '../../../CourseSummary/PercentageCell'
import FeedbackResponseChip from '../../../MyTeaching/FeedbackResponseChip'

import { getStartAndEndString } from '../../../../util/getDateRangeString'
import { getLanguageValue } from '../../../../util/languageUtils'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import InterimFeedbackEditor from './InterimFeedbackEditor'
import { getInitialInterimFeedbackValues, getInterimFeedbackSchema, getInterimFeedbackEditSchema } from './utils'
import { useInterimFeedbacks } from './useInterimFeedbacks'
import {
  useCreateInterimFeedbackMutation,
  useDeleteInterimFeedbackMutation,
  useEditInterimFeedbackMutation,
} from './useInterimFeedbackMutation'

const styles = {
  dates: {
    color: '#646464',
    marginBottom: 3,
  },
  buttonContainer: {
    mb: 2,
    display: 'flex',
    justifyContent: 'flex-start',
    '@media print': {
      display: 'none',
    },
  },
}

const InterimFeedbackItem = ({ interimFeedback }) => {
  const { id: parentId } = useParams()
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const { language } = i18n
  const [showForm, setShowForm] = useState(false)

  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()
  const editMutation = useEditInterimFeedbackMutation(parentId)
  const deleteMutation = useDeleteInterimFeedbackMutation(parentId)
  const deleteInterimFeedback = useInteractiveMutation(fbtId => deleteMutation.mutateAsync(fbtId), {
    success: t('organisationSurveys:removeSuccess'),
  })

  const interimFeedbackSchema = getInterimFeedbackEditSchema(t)

  const surveyValues = { name: interimFeedback.name }

  const {
    opensAt,
    closesAt,
    feedbackCount,
    feedbackResponse,
    feedbackResponseEmailSent,
    students,
    userFeedbackTargets: teachers,
  } = interimFeedback

  const isAdmin = !isUserLoading && authorizedUser.isAdmin
  const studentCount = students.length
  const allowDelete = interimFeedback.feedbackCount === 0
  const allowEdit = new Date() <= Date.parse(closesAt)
  const isOpen = feedbackTargetIsOpen(interimFeedback)
  const [startDate, endDate] = getStartAndEndString(opensAt, closesAt)
  const periodInfo = t('common:feedbackOpenPeriod', {
    opensAt: startDate,
    closesAt: endDate,
  })

  const handleClose = () => setShowForm(!showForm)

  const handleSubmit = async data => {
    const values = {
      fbtId: interimFeedback.id,
      ...data,
    }
    await editMutation.mutateAsync(values, {
      onSuccess: () => {
        handleClose()
        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      },
      onError: error => {
        handleClose()
        enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
      },
    })
  }

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    if ((!isAdmin && !allowDelete) || !window.confirm(t('interimFeedback:confirmRemoveSurvey'))) return

    await deleteInterimFeedback(interimFeedback.id)
  }

  if (showForm)
    return (
      <InterimFeedbackEditor
        title={t('interimFeedback:editSurvey')}
        initialValues={surveyValues}
        validationSchema={interimFeedbackSchema}
        handleSubmit={handleSubmit}
        editing={showForm}
        onStopEditing={handleClose}
        editView
      />
    )

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography sx={{ textTransform: 'capitalize', fontWeight: 'light' }} variant="h5" component="div">
          {getLanguageValue(interimFeedback.name, language)}
        </Typography>

        {Date.parse(opensAt) < new Date() ? (
          <Box sx={{ mt: 2, ml: -1 }}>
            <FeedbackResponseChip
              id={interimFeedback.id}
              feedbackResponseGiven={Boolean(feedbackResponse)}
              feedbackResponseSent={feedbackResponseEmailSent}
              ongoing={isOpen}
            />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" component="span">
              {t('teacherView:feedbackNotStarted')}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" sx={{ mt: 2 }}>
          {periodInfo}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2">{t('interimFeedback:givenFeedback')}:</Typography>
          <PercentageCell
            size="small"
            label={`${feedbackCount}/${studentCount}`}
            percent={(feedbackCount / studentCount) * 100}
          />
        </Box>

        {teachers.length > 0 && (
          <Box sx={{ my: 2, display: 'flex', flexWrap: 'wrap' }}>
            <Typography variant="body2">{t('interimFeedback:responsibleTeachers')}:</Typography>
            {teachers.map(({ user: teacher }) => (
              <Chip key={teacher.id} size="small" sx={{ mr: 1 }} label={`${teacher.firstName} ${teacher.lastName}`} />
            ))}
          </Box>
        )}

        <Button
          color="primary"
          variant="outlined"
          sx={{ mt: 2 }}
          component={Link}
          to={`/targets/${interimFeedback.id}/feedback`}
        >
          {t('interimFeedback:viewFeedback')}
        </Button>

        {allowEdit && (
          <Button
            disabled={showForm}
            color="primary"
            variant="outlined"
            sx={{ mt: 2, ml: 2 }}
            onClick={() => setShowForm(!showForm)}
          >
            {t('interimFeedback:edit')}
          </Button>
        )}

        {(allowDelete || isAdmin) && (
          <Button disabled={showForm} color="error" variant="outlined" sx={{ mt: 2, ml: 2 }} onClick={handleDelete}>
            {t('interimFeedback:remove')} {isAdmin && !allowDelete && '(ADMIN)'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

const InterimFeedback = () => {
  const history = useHistory()
  const { id: parentId } = useParams()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [showForm, setShowForm] = useState(false)

  const { interimFeedbacks, isLoading: isInterimFeedbacksLoading } = useInterimFeedbacks(parentId)
  const mutation = useCreateInterimFeedbackMutation(parentId)

  if (isInterimFeedbacksLoading) {
    return <LoadingProgress />
  }

  const interimFeedbackSchema = getInterimFeedbackSchema(t)

  const initialValues = getInitialInterimFeedbackValues()

  const handleClose = () => setShowForm(!showForm)

  const handleSubmit = async values => {
    await mutation.mutateAsync(values, {
      onSuccess: data => {
        handleClose()

        history.push(`/targets/${data.id}/edit`)
        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      },
      onError: error => {
        handleClose()
        enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
      },
    })
  }

  return (
    <Box mb={6} px={1}>
      <Alert sx={{ mb: 2 }} severity="warning">
        {t('interimFeedback:heading')}
      </Alert>
      <Box sx={styles.buttonContainer}>
        <Button
          color="primary"
          onClick={() => {
            setShowForm(!showForm)
          }}
          disabled={showForm}
        >
          {t('interimFeedback:addSurvey')}
        </Button>
      </Box>

      <InterimFeedbackEditor
        title={t('interimFeedback:addSurvey')}
        initialValues={initialValues}
        validationSchema={interimFeedbackSchema}
        handleSubmit={handleSubmit}
        editing={showForm}
        onStopEditing={handleClose}
      />

      {interimFeedbacks.length > 0 ? (
        interimFeedbacks.map(feedback => <InterimFeedbackItem key={feedback.id} interimFeedback={feedback} />)
      ) : (
        <Alert sx={{ mt: 2 }} severity="info">
          {t('interimFeedback:emptySurveys')}
        </Alert>
      )}
    </Box>
  )
}

export default InterimFeedback
