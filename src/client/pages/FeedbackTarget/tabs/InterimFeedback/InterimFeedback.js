import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import * as Yup from 'yup'
import { addDays } from 'date-fns'

import { Alert, Card, CardContent, Box, Button, Typography, Chip } from '@mui/material'

import { Link, useParams, useHistory } from 'react-router-dom'

import useAuthorizedUser from '../../../../hooks/useAuthorizedUser'

import { LoadingProgress } from '../../../../components/common/LoadingProgress'

import PercentageCell from '../../../CourseSummary/PercentageCell'
import FeedbackResponseChip from '../../../MyTeaching/FeedbackResponseChip'

import { getStartAndEndString } from '../../../../util/getDateRangeString'
import { getLanguageValue } from '../../../../util/languageUtils'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'

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
  const { code } = useParams()
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const { language } = i18n
  const [showForm, setShowForm] = useState(false)

  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()

  const surveyValues = {
    name: interimFeedback.name,
    startDate: interimFeedback.opensAt,
    endDate: interimFeedback.closesAt,
  }

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

  const handleSubmit = async (data, { setErrors }) => {
    console.log('EDIT', data)
  }

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    if ((!isAdmin && !allowDelete) || !window.confirm(t('interimFeedback:confirmRemoveSurvey'))) return

    console.log('DELETE')
  }

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
  const params = useParams()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [showForm, setShowForm] = useState(false)

  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()

  if (isUserLoading) {
    return <LoadingProgress />
  }

  const initialValues = {
    name: {
      fi: '',
      en: '',
      sv: '',
    },
    startDate: addDays(new Date(), 1),
    endDate: addDays(new Date(), 7),
  }

  const interimFeedbacks = []

  const handleClose = () => setShowForm(!showForm)

  const handleSubmit = async (data, { setErrors }) => {
    console.log('CREATE', data)
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
