import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Button, Typography } from '@mui/material'

import { Link, useParams } from 'react-router-dom'

import useOrganisationSurveys from './useOrganisationSurveys'
import OrganisationSurveyEditor from './OrganisationSurveyEditor'
import { useCreateOrganisationSurveyMutation } from './useOrganisationSurveyMutation'

import useInteractiveMutation from '../../hooks/useInteractiveMutation'

import Title from '../../components/common/Title'
import { LoadingProgress } from '../../components/common/LoadingProgress'

import { formateDates } from './utils'

const styles = {
  realisationContainer: {
    marginTop: 4,
    marginBottom: 6,
  },
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

const OrganisationSurvey = ({ organisationSurvey }) => {
  const { i18n } = useTranslation()
  const { language } = i18n
  const organisationSurveyDates = formateDates(organisationSurvey.courseRealisation)

  return (
    <Box key={organisationSurvey.id} sx={styles.realisationContainer}>
      <Link to={`/targets/${organisationSurvey.id}/feedback`} sx={styles.realisationTitle} replace>
        {organisationSurvey.name[language] || organisationSurvey.name}
      </Link>
      <Typography variant="body2" component="p" sx={styles.dates}>
        {organisationSurveyDates}
      </Typography>
    </Box>
  )
}

const OrganisationSurveys = () => {
  const [showForm, setShowForm] = useState(false)
  const { t } = useTranslation()
  const { code } = useParams()
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
  }

  const createOrganisationSurvey = useInteractiveMutation(surveyValues =>
    mutation.mutateAsync({ ...surveyValues, studentNumbers: [], teacherIds: [] })
  )

  const handleSubmit = async values => {
    setShowForm(!showForm)

    await createOrganisationSurvey(values)
  }

  const handleClose = () => setShowForm(!showForm)

  if (isOrganisationSurveysLoading) {
    return <LoadingProgress />
  }

  return (
    <>
      <Title>{t('common:courseSummaryPage')}</Title>
      <Box mb={6} px={1}>
        <Box display="flex" gap="1rem" alignItems="end">
          <Typography variant="h4" component="h1">
            {t('organisationSurveys:heading')}
          </Typography>
        </Box>

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
          handleSubmit={handleSubmit}
          editing={showForm}
          onStopEditing={handleClose}
        />

        {surveys.map(survey => (
          <OrganisationSurvey key={survey.id} organisationSurvey={survey} />
        ))}
      </Box>
    </>
  )
}

export default OrganisationSurveys
