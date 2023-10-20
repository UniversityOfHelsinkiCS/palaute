import React, { useState } from 'react'
import { Autocomplete, Card, CardContent, Button, Box, Grid, Typography, TextField } from '@mui/material'
import { useFormikContext, Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { debounce } from 'lodash'

import FormikDatePicker from '../../components/common/FormikDatePicker'
import FormikTextField from '../../components/common/FormikTextField'

import apiClient from '../../util/apiClient'

const LanguageEditor = ({ name, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <Box mb={2}>
      <FormikTextField
        id={`organisation-survey-${language}-${name}`}
        name={`${name}.${language}`}
        label={t('organisationSurveys:newSurveyName')}
        fullWidth
      />
    </Box>
  )
}

const ResponsibleTeachersSelector = ({ name, ...props }) => {
  const { t } = useTranslation()
  const formikProps = useFormikContext()
  const [potentialUsers, setPotentialUsers] = useState([])

  const handleChange = debounce(async ({ target }) => {
    const query = target.value
    if (query.length < 5) return

    const params = {
      email: query,
    }

    const { data } = await apiClient.get('/users', { params })
    const { persons } = data

    setPotentialUsers(persons)
  }, 400)

  return (
    <Box>
      <Typography variant="body1" mb={2}>
        {t('organisationSurveys:responsibleTeacherTitle')}
      </Typography>

      <Autocomplete
        id={name}
        name={name}
        multiple
        fullWidth
        defaultValue={[]}
        onChange={(_, teachers) => {
          const teacherIds = teachers.map(t => t.id)

          return formikProps.setFieldValue('teacherIds', teacherIds)
        }}
        options={potentialUsers}
        onInputChange={handleChange}
        getOptionLabel={option => option.email}
        renderInput={params => <TextField {...params} />}
        {...props}
      />
    </Box>
  )
}

const StudentNumberInput = ({ name, ...props }) => {
  const { t } = useTranslation()
  const formikProps = useFormikContext()

  const handleChange = ({ target }) => {
    const { value } = target

    const studentNumbers = value.split(/[,\n;]/).filter(v => v !== '')
    formikProps.setFieldValue('studentNumbers', studentNumbers)
  }

  return (
    <Box>
      <Typography variant="body1" mb={2}>
        {t('organisationSurveys:studentNumberTitle')}
      </Typography>

      <TextField
        id={name}
        name={name}
        multiline
        rows={5}
        variant="outlined"
        fullWidth
        onChange={handleChange}
        defaultValue={[]}
        {...props}
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

          <LanguageEditor name="name" language={language} />
        </Grid>
      ))}
      <Grid md={6} sm={12} xs={12} item>
        <FormikDatePicker name="startDate" label={t('organisationSurveys:startDate')} />
      </Grid>
      <Grid md={6} sm={12} xs={12} item>
        <FormikDatePicker name="endDate" label={t('organisationSurveys:endDate')} />
      </Grid>
      <Grid xs={12} item>
        <ResponsibleTeachersSelector name="teacherIds" label={t('organisationSurveys:responsibleTeacherEmail')} />
      </Grid>
      <Grid xs={12} item>
        <StudentNumberInput name="studentNumbers" label={t('organisationSurveys:studentNumberInputLabel')} />
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
