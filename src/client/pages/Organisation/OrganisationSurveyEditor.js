import React from 'react'
import { Card, CardContent, Button, Box, Grid, Typography } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'

import FormikDatePicker from '../../components/common/FormikDatePicker'
import FormikTextField from '../../components/common/FormikTextField'

const LanguageOpenEditor = ({ name, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <Box mb={2}>
      <FormikTextField
        id={`organisation-survey-${language}-${name}`}
        name={`${name}.${language}`}
        label={t('questionEditor:label')}
        fullWidth
      />
    </Box>
  )
}

const OrganisationSurveyForm = ({ languages = ['fi', 'sv', 'en'] }) => {
  const { t } = useTranslation()

  return (
    <Grid spacing={4} container>
      {languages.map(language => (
        <Grid md={4} sm={12} xs={12} item key={language}>
          <Box mb={2}>
            <Typography variant="h6" component="h2">
              {language.toUpperCase()}
            </Typography>
          </Box>

          <LanguageOpenEditor name="name" language={language} />
        </Grid>
      ))}
      <Grid md={6} sm={12} xs={12} item>
        <FormikDatePicker
          name="startDate"
          label={t('organisationSettings:startDate')}
          id="organisation-survey-startDate"
        />
      </Grid>
      <Grid md={6} sm={12} xs={12} item>
        <FormikDatePicker name="endDate" label={t('organisationSettings:endDate')} id="organisation-survey-endDate" />
      </Grid>
    </Grid>
  )
}

const OrganisationSurveyEditor = ({ initialValues, handleSubmit, editing, onStopEditing }) => {
  const { t } = useTranslation()

  if (!editing) return null

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} validateOnChange={false}>
      {({ isSubmitting }) => {
        const disabled = isSubmitting

        return (
          <Form>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <OrganisationSurveyForm />
              </CardContent>
              <Box sx={{ m: 2 }}>
                <Button disabled={disabled} color="primary" variant="contained" type="submit">
                  {t('common:save')}
                </Button>
                <Button sx={{ ml: 4 }} color="error" variant="contained" type="button" onClick={onStopEditing}>
                  {t('common:cancel')}
                </Button>
              </Box>
            </Card>
          </Form>
        )
      }}
    </Formik>
  )
}

export default OrganisationSurveyEditor
