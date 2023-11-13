import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import * as Yup from 'yup'

import { Alert, Card, CardContent, Box, Button, Typography, Chip } from '@mui/material'

import { Link, useParams, useHistory } from 'react-router-dom'

import { useOrganisationSurveys } from './useOrganisationSurveys'
import OrganisationSurveyEditor from './OrganisationSurveyEditor'
import {
  useCreateOrganisationSurveyMutation,
  useEditOrganisationSurveyMutation,
  useDeleteOrganisationSurveyMutation,
} from './useOrganisationSurveyMutation'

import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useInteractiveMutation from '../../hooks/useInteractiveMutation'

import PercentageCell from '../CourseSummary/PercentageCell'
import FeedbackResponseChip from '../MyTeaching/FeedbackResponseChip'
import { LoadingProgress } from '../../components/common/LoadingProgress'

import { getStartAndEndString } from '../../util/getDateRangeString'
import { getLanguageValue } from '../../util/languageUtils'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'

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

const getOrganisationSurveySchema = t =>
  Yup.object().shape({
    name: Yup.object().shape(
      {
        fi: Yup.string().when(['sv', 'en'], {
          is: (sv, en) => !sv && !en,
          then: () => Yup.string().required(t('validationErrors:required')),
          otherwise: () => Yup.string(),
        }),
        sv: Yup.string().when(['fi', 'en'], {
          is: (fi, en) => !fi && !en,
          then: () => Yup.string().required(t('validationErrors:required')),
          otherwise: () => Yup.string(),
        }),
        en: Yup.string().when(['fi', 'sv'], {
          is: (fi, sv) => !fi && !sv,
          then: () => Yup.string().required(t('validationErrors:required')),
          otherwise: () => Yup.string(),
        }),
      },
      [
        ['sv', 'en'],
        ['fi', 'en'],
        ['fi', 'sv'],
      ]
    ),
    startDate: Yup.date().required(t('validationErrors:invalidDate')),
    endDate: Yup.date()
      .required(t('validationErrors:invalidDate'))
      .min(Yup.ref('startDate'), t('validationErrors:wrongDate')),
    studentNumbers: Yup.array().of(Yup.string()),
    teachers: Yup.array().of(Yup.object()),
  })

const getOverlappingStudentTeachers = data => {
  const { studentNumbers } = data
  const overlappingStudentTeachers = data.teachers.filter(t => studentNumbers.includes(t.studentNumber))

  return overlappingStudentTeachers
}

const OrganisationSurveyItem = ({ organisationSurvey }) => {
  const { code } = useParams()
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const { language } = i18n
  const [showForm, setShowForm] = useState(false)

  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()
  const editMutation = useEditOrganisationSurveyMutation(code)
  const deleteMutation = useDeleteOrganisationSurveyMutation(code)
  const deleteOrganisationSurvey = useInteractiveMutation(surveyId => deleteMutation.mutateAsync(surveyId), {
    success: t('organisationSurveys:removeSuccess'),
  })

  const surveyValues = {
    name: organisationSurvey.name,
    startDate: organisationSurvey.opensAt,
    endDate: organisationSurvey.closesAt,
    studentNumbers: organisationSurvey.students.map(s => s.user.studentNumber),
    teachers: organisationSurvey.userFeedbackTargets.map(t => t.user),
  }

  const organisationSurveySchema = getOrganisationSurveySchema(t)

  const {
    opensAt,
    closesAt,
    feedbackCount,
    feedbackResponse,
    feedbackResponseEmailSent,
    students,
    userFeedbackTargets: teachers,
  } = organisationSurvey

  const isAdmin = !isUserLoading && authorizedUser.isAdmin
  const studentCount = students.length
  const allowDelete = organisationSurvey.feedbackCount === 0
  const allowEdit = new Date() <= Date.parse(closesAt)
  const isOpen = feedbackTargetIsOpen(organisationSurvey)
  const [startDate, endDate] = getStartAndEndString(opensAt, closesAt)
  const periodInfo = t('common:feedbackOpenPeriod', {
    opensAt: startDate,
    closesAt: endDate,
  })

  const handleClose = () => setShowForm(!showForm)

  const handleSubmit = async (data, { setErrors }) => {
    const overlappingStudentTeachers = getOverlappingStudentTeachers(data)

    if (overlappingStudentTeachers.length > 0) {
      setErrors({ studentNumbers: overlappingStudentTeachers.map(t => t.studentNumber) })
      return
    }

    const values = {
      surveyId: organisationSurvey.id,
      ...data,
      teacherIds: data.teachers.map(t => t.id),
    }

    await editMutation.mutateAsync(values, {
      onSuccess: () => {
        handleClose()

        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      },
      onError: error => {
        if (error.isAxiosError && error.response && error.response.data && error.response.data.invalidStudentNumbers) {
          const { invalidStudentNumbers } = error.response.data

          setErrors({ studentNumbers: invalidStudentNumbers })
        } else {
          handleClose()
          enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
        }
      },
    })
  }

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    if ((!isAdmin && !allowDelete) || !window.confirm(t('organisationSurveys:confirmRemoveSurvey'))) return

    await deleteOrganisationSurvey(organisationSurvey.id)
  }

  if (showForm)
    return (
      <OrganisationSurveyEditor
        title={t('organisationSurveys:editSurvey')}
        initialValues={surveyValues}
        validationSchema={organisationSurveySchema}
        handleSubmit={handleSubmit}
        editing={showForm}
        onStopEditing={handleClose}
      />
    )

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography sx={{ textTransform: 'capitalize', fontWeight: 'light' }} variant="h5" component="div">
          {getLanguageValue(organisationSurvey.name, language)}
        </Typography>

        <Box sx={{ mt: 2, ml: -1 }}>
          <FeedbackResponseChip
            id={organisationSurvey.id}
            feedbackResponseGiven={Boolean(feedbackResponse)}
            feedbackResponseSent={feedbackResponseEmailSent}
            ongoing={isOpen}
          />
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          {periodInfo}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2">{t('organisationSurveys:givenFeedback')}:</Typography>
          <PercentageCell
            size="small"
            label={`${feedbackCount}/${studentCount}`}
            percent={(feedbackCount / studentCount) * 100}
          />
        </Box>

        {teachers.length > 0 && (
          <Box sx={{ my: 2, display: 'flex', flexWrap: 'wrap' }}>
            <Typography variant="body2">{t('organisationSurveys:responsibleTeachers')}:</Typography>
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
          to={`/targets/${organisationSurvey.id}/feedback`}
        >
          {t('organisationSurveys:viewFeedbackSummary')}
        </Button>

        {allowEdit && (
          <Button
            disabled={showForm}
            color="primary"
            variant="outlined"
            sx={{ mt: 2, ml: 2 }}
            onClick={() => setShowForm(!showForm)}
          >
            {t('organisationSurveys:edit')}
          </Button>
        )}

        {(allowDelete || isAdmin) && (
          <Button disabled={showForm} color="error" variant="outlined" sx={{ mt: 2, ml: 2 }} onClick={handleDelete}>
            {t('organisationSurveys:remove')} {isAdmin && !allowDelete && 'ADMIN'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

const OrganisationSurveys = () => {
  const history = useHistory()
  const { code } = useParams()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [showForm, setShowForm] = useState(false)

  const mutation = useCreateOrganisationSurveyMutation(code)
  const { surveys, isLoading: isOrganisationSurveysLoading } = useOrganisationSurveys(code)

  const organisationSurveySchema = getOrganisationSurveySchema(t)

  const initialValues = {
    name: {
      fi: '',
      en: '',
      sv: '',
    },
    startDate: new Date(),
    endDate: new Date(),
    studentNumbers: [],
    teachers: [],
  }

  const handleClose = () => setShowForm(!showForm)

  const handleSubmit = async (data, { setErrors }) => {
    const overlappingStudentTeachers = getOverlappingStudentTeachers(data)

    if (overlappingStudentTeachers.length > 0) {
      setErrors({ studentNumbers: overlappingStudentTeachers.map(t => t.studentNumber) })
      return
    }

    const values = {
      ...data,
      teacherIds: data.teachers.map(t => t.id),
    }

    await mutation.mutateAsync(values, {
      onSuccess: data => {
        handleClose()

        history.push(`/targets/${data.id}/edit`)
        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      },
      onError: error => {
        if (error.isAxiosError && error.response && error.response.data && error.response.data.invalidStudentNumbers) {
          const { invalidStudentNumbers } = error.response.data

          setErrors({ studentNumbers: invalidStudentNumbers })
        } else {
          handleClose()
          enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
        }
      },
    })
  }

  if (isOrganisationSurveysLoading) {
    return <LoadingProgress />
  }

  return (
    <Box mb={6} px={1}>
      <Alert sx={{ mb: 2 }} severity="warning">
        {t('organisationSurveys:heading')}
      </Alert>
      <Box sx={styles.buttonContainer}>
        <Button
          color="primary"
          onClick={() => {
            setShowForm(!showForm)
          }}
          disabled={showForm}
        >
          {t('organisationSurveys:addSurvey')}
        </Button>
      </Box>

      <OrganisationSurveyEditor
        title={t('organisationSurveys:addSurvey')}
        initialValues={initialValues}
        validationSchema={organisationSurveySchema}
        handleSubmit={handleSubmit}
        editing={showForm}
        onStopEditing={handleClose}
      />

      {surveys.length > 0 ? (
        surveys.map(survey => <OrganisationSurveyItem key={survey.id} organisationSurvey={survey} />)
      ) : (
        <Alert sx={{ mt: 2 }} severity="info">
          {t('organisationSurveys:emptySurveys')}
        </Alert>
      )}
    </Box>
  )
}

export default OrganisationSurveys
