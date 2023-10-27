import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import * as Yup from 'yup'

import { Alert, Card, CardContent, Box, Button, Typography } from '@mui/material'

import { Link, useParams } from 'react-router-dom'

import useOrganisationSurveys from './useOrganisationSurveys'
import OrganisationSurveyEditor from './OrganisationSurveyEditor'
import {
  useCreateOrganisationSurveyMutation,
  useDeleteOrganisationSurveyMutation,
} from './useOrganisationSurveyMutation'

import useInteractiveMutation from '../../hooks/useInteractiveMutation'

import Title from '../../components/common/Title'
import { LoadingProgress } from '../../components/common/LoadingProgress'

import { getStartAndEndString } from '../../util/getDateRangeString'
import { getLanguageValue } from '../../util/languageUtils'

const styles = {
  dates: {
    color: '#646464',
    marginBottom: 3,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    '@media print': {
      display: 'none',
    },
  },
}

const OrganisationSurveyItem = ({ organisationSurvey }) => {
  const { t, i18n } = useTranslation()
  const { language } = i18n
  const { code } = useParams()

  const mutation = useDeleteOrganisationSurveyMutation(code)
  const deleteOrganisationSurvey = useInteractiveMutation(surveyId => mutation.mutateAsync(surveyId), {
    success: t('organisationSettings:removeSuccess'),
  })

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(t('organisationSettings:confirmRemoveSurvey'))) return

    await deleteOrganisationSurvey(organisationSurvey.id)
  }

  const { courseRealisation } = organisationSurvey
  const viewPath = `/targets/${organisationSurvey.id}/feedback`

  const [startDate, endDate] = getStartAndEndString(courseRealisation?.startDate, courseRealisation?.endDate)
  const periodInfo = t('common:feedbackOpenPeriod', {
    opensAt: startDate,
    closesAt: endDate,
  })

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="body1" fontWeight={600} component="h2">
          {getLanguageValue(organisationSurvey.name, language)}
        </Typography>

        <Typography variant="body1" sx={{ mt: 2 }}>
          {periodInfo}
        </Typography>

        <Button color="primary" variant="outlined" sx={{ mt: 2 }} component={Link} to={viewPath}>
          {t('organisationSurveys:viewFeedbackSummary')}
        </Button>

        <Button color="error" variant="outlined" sx={{ mt: 2, ml: 2 }} onClick={handleDelete}>
          {t('organisationSettings:remove')}
        </Button>
      </CardContent>
    </Card>
  )
}

const OrganisationSurveys = () => {
  const { t } = useTranslation()
  const { code } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const [showForm, setShowForm] = useState(false)
  const { surveys, isLoading: isOrganisationSurveysLoading } = useOrganisationSurveys(code)
  const mutation = useCreateOrganisationSurveyMutation(code)

  const initialValues = {
    name: {
      fi: '',
      en: '',
      sv: '',
    },
    startDate: new Date(),
    endDate: new Date(),
    studentNumbers: [],
    teacherIds: [],
  }

  const organisationSurveySchema = Yup.object().shape({
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
    teacherIds: Yup.array().of(Yup.string()),
  })

  const handleClose = () => setShowForm(!showForm)

  const handleSubmit = async (values, { setErrors }) => {
    await mutation.mutateAsync(values, {
      onSuccess: () => {
        handleClose()
        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      },
      onError: error => {
        if (error.isAxiosError && error.response && error.response.data && error.response.data.invalidStudentNumbers) {
          const { invalidStudentNumbers } = error.response.data
          const errorString = `
            ${t('validationErrors:invalidStudentNumbers')}
      
            ${invalidStudentNumbers.join(', ')}
          `

          setErrors({ studentNumbers: errorString })
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
    <>
      <Title>{t('common:courseSummaryPage')}</Title>
      <Box mb={6} px={1}>
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
          initialValues={initialValues}
          validationSchema={organisationSurveySchema}
          handleSubmit={handleSubmit}
          editing={showForm}
          onStopEditing={handleClose}
        />

        {surveys.length > 0 ? (
          surveys.map(survey => <OrganisationSurveyItem key={survey.id} organisationSurvey={survey} />)
        ) : (
          <Alert severity="info">{t('organisationSurveys:emptySurveys')}</Alert>
        )}
      </Box>
    </>
  )
}

export default OrganisationSurveys
