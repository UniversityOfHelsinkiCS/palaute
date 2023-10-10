import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, Box, Button, Typography } from '@mui/material'

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

  const [startDate, endDate] = getStartAndEndString(courseRealisation.startDate, courseRealisation.endDate)
  const periodInfo = t('common:feedbackOpenPeriod', {
    opensAt: startDate,
    closesAt: endDate,
  })

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="body1" fontWeight={600} component="h2">
          {organisationSurvey.name[language] || organisationSurvey.name}
        </Typography>

        <Typography variant="body1" sx={{ mt: 2 }}>
          {periodInfo}
        </Typography>

        <Button color="primary" variant="outlined" sx={{ mt: 2 }} component={Link} to={viewPath}>
          {t('userFeedbacks:viewFeedbackSummary')}
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
          <OrganisationSurveyItem key={survey.id} organisationSurvey={survey} />
        ))}
      </Box>
    </>
  )
}

export default OrganisationSurveys
