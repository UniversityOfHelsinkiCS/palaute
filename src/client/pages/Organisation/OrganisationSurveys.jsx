import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { addDays } from 'date-fns'

import { Alert, Box } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { Add } from '@mui/icons-material'

import OrganisationSurveyItem from './OrganisationSurveyItem'
import { useOrganisationSurveys } from './useOrganisationSurveys'
import OrganisationSurveyEditor from './OrganisationSurveyEditor'
import { useCreateOrganisationSurveyMutation } from './useOrganisationSurveyMutation'

import useAuthorizedUser from '../../hooks/useAuthorizedUser'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import { NorButton } from '../../components/common/NorButton'

import { getOverlappingStudentTeachers, getOrganisationSurveySchema } from './utils'

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

const OrganisationSurveys = () => {
  const navigate = useNavigate()
  const { code } = useParams()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [showForm, setShowForm] = useState(false)

  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()
  const mutation = useCreateOrganisationSurveyMutation(code)
  const { surveys, isLoading: isOrganisationSurveysLoading } = useOrganisationSurveys(code)

  const organisationSurveySchema = getOrganisationSurveySchema(t)

  if (isUserLoading || isOrganisationSurveysLoading) {
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
    studentNumbers: [],
    teachers: [authorizedUser],
    courses: [],
  }

  const handleClose = () => setShowForm(!showForm)

  const handleSubmit = async (data, { setErrors }) => {
    const overlappingStudentTeachers = getOverlappingStudentTeachers(data)

    if (overlappingStudentTeachers.length > 0) {
      setErrors({
        studentNumbers: {
          text: t('validationErrors:overlappingStudentTeacher'),
          data: overlappingStudentTeachers.map(t => t.studentNumber),
        },
      })
      return
    }

    const values = {
      ...data,
      teacherIds: data.teachers.map(t => t.id),
      courseRealisationIds: data.courses.map(c => c.id),
    }

    await mutation.mutateAsync(values, {
      onSuccess: data => {
        handleClose()

        navigate(`/targets/${data.id}/edit`)
        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      },
      onError: error => {
        if (error.isAxiosError && error.response && error.response.data && error.response.data.invalidStudentNumbers) {
          const { invalidStudentNumbers } = error.response.data

          setErrors({
            studentNumbers: {
              text: t('validationErrors:invalidStudentNumbers'),
              data: invalidStudentNumbers,
            },
          })
        } else {
          handleClose()
          enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
        }
      },
    })
  }

  return (
    <Box mb={6} px={1}>
      <Box sx={styles.buttonContainer}>
        <NorButton
          data-cy="organisation-surveys-add-new"
          color="primary"
          onClick={() => {
            setShowForm(!showForm)
          }}
          disabled={showForm}
          icon={<Add />}
        >
          {t('organisationSurveys:addSurvey')}
        </NorButton>
      </Box>

      <OrganisationSurveyEditor
        title={t('organisationSurveys:addSurvey')}
        initialValues={initialValues}
        validationSchema={organisationSurveySchema}
        handleSubmit={handleSubmit}
        editing={showForm}
        onStopEditing={handleClose}
        organisationCode={code}
      />

      {surveys.length > 0 ? (
        surveys.map(survey => <OrganisationSurveyItem key={survey.id} organisationSurvey={survey} />)
      ) : (
        <Alert data-cy="organisation-surveys-no-surveys-alert" sx={{ mt: 2 }} severity="info">
          {t('organisationSurveys:emptySurveys')}
        </Alert>
      )}
    </Box>
  )
}

export default OrganisationSurveys
