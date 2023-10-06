import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, Box, Button, Typography } from '@mui/material'
import { Form, Formik } from 'formik'

import { Link, useParams } from 'react-router-dom'

import useOrganisationSurveys from './useOrganisationSurveys'
import { useCreateOrganisationSurveyMutation } from './useOrganisationSurveyMutation'

import useInteractiveMutation from '../../hooks/useInteractiveMutation'

import Title from '../../components/common/Title'
import FormikTextField from '../../components/common/FormikTextField'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import FormikDatePicker from '../../components/common/FormikDatePicker'

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

const OrganisationSurveyForm = ({ isOpen, close, handleSubmit }) => {
  const { t } = useTranslation()

  const initialValues = {
    name: '',
    startDate: new Date(),
    endDate: new Date(),
  }

  if (!isOpen) return null

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} validateOnChange={false}>
      {({ isSubmitting }) => {
        const disabled = isSubmitting

        return (
          <Form>
            <Card>
              <CardContent>
                <FormikTextField name="name" label="Name of the survey" id="name" fullWidth />
                <FormikDatePicker name="startDate" label="Start date" id="startDate" />
                <FormikDatePicker name="endDate" label="End date" id="endDate" />
              </CardContent>
            </Card>

            <Box mt={2}>
              <Button disabled={disabled} color="primary" variant="contained" type="submit">
                {t('common:save')}
              </Button>
              <Button sx={{ ml: 4 }} color="error" variant="contained" type="button" onClick={close}>
                {t('common:cancel')}
              </Button>
            </Box>
          </Form>
        )
      }}
    </Formik>
  )
}

const OrganisationSurvey = ({ organisationSurvey }) => {
  const organisationSurveyDates = formateDates(organisationSurvey.courseRealisation)

  return (
    <Box key={organisationSurvey.id} sx={styles.realisationContainer}>
      <Link to={`/targets/${organisationSurvey.id}/feedback`} sx={styles.realisationTitle} replace>
        {organisationSurvey.name}
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

        <OrganisationSurveyForm isOpen={showForm} close={handleClose} handleSubmit={handleSubmit} />

        {surveys.map(survey => (
          <OrganisationSurvey key={survey.id} organisationSurvey={survey} />
        ))}
      </Box>
    </>
  )
}

export default OrganisationSurveys
