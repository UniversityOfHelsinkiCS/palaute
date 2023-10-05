import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, Box, Button, Typography } from '@mui/material'
import { Form, Formik } from 'formik'

import { useParams } from 'react-router-dom'
import { useSnackbar } from 'notistack'

import useOrganisationSurveys from '../../hooks/useOrganisationSurveys'
import { useCreateOrganisationSurveyMutation } from '../../hooks/useOrganisationSurveyMutation'

import Title from '../../components/common/Title'
import FormikTextField from '../../components/common/FormikTextField'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import FormikDatePicker from '../../components/common/FormikDatePicker'

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

const OrganisationSurveys = () => {
  const [showForm, setShowForm] = useState(false)
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { code } = useParams()
  const { surveys, isLoading: isOrganisationSurveysLoading } = useOrganisationSurveys(code)
  const mutation = useCreateOrganisationSurveyMutation(code)

  const handleSubmit = async values => {
    setShowForm(!showForm)

    try {
      mutation.mutate(values)
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    } catch (e) {
      console.error(e)
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const handleClose = () => setShowForm(!showForm)

  if (isOrganisationSurveysLoading) {
    return <LoadingProgress />
  }

  console.log(surveys)

  return (
    <>
      <Title>{t('common:courseSummaryPage')}</Title>
      <Box mb={6} px={1}>
        <Box display="flex" gap="1rem" alignItems="end">
          <Typography variant="h4" component="h1">
            {t('organisationSurveys:heading')}
          </Typography>
        </Box>
        <Box mt={4} />

        <OrganisationSurveyForm isOpen={showForm} close={handleClose} handleSubmit={handleSubmit} />

        <Box mt={4}>
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
      </Box>
    </>
  )
}

export default OrganisationSurveys
