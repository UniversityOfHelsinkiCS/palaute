import React from 'react'
import { Button, Box, Dialog, Grid, DialogTitle } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'

import FormikDatePicker from '../../../../components/common/FormikDatePicker'
import FormikLocalesFieldEditor from '../../../../components/common/FormikLocalesFieldEditor'

const InterimFeedbackForm = () => {
  const { t } = useTranslation()

  return (
    <Grid spacing={4} container>
      <FormikLocalesFieldEditor name="name" localesLabelString="interimFeedback:newSurveyName" />

      <Grid md={6} sm={12} xs={12} item>
        <FormikDatePicker name="startDate" label={t('interimFeedback:startDate')} />
      </Grid>
      <Grid md={6} sm={12} xs={12} item>
        <FormikDatePicker name="endDate" label={t('interimFeedback:endDate')} />
      </Grid>
    </Grid>
  )
}

const EditInterimFeedbackForm = () => {
  const { t } = useTranslation()

  return (
    <Grid spacing={4} container>
      <FormikLocalesFieldEditor name="name" localesLabelString="interimFeedback:newSurveyName" />

      <Grid md={6} sm={12} xs={12} item>
        <FormikDatePicker name="startDate" label={t('interimFeedback:startDate')} />
      </Grid>
      <Grid md={6} sm={12} xs={12} item>
        <FormikDatePicker name="endDate" label={t('interimFeedback:endDate')} />
      </Grid>
    </Grid>
  )
}

const InterimFeedbackEditor = ({
  title,
  initialValues,
  validationSchema,
  handleSubmit,
  editing,
  onStopEditing,
  editView = false,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog maxWidth={false} open={editing} onClose={onStopEditing}>
      <DialogTitle>{title}</DialogTitle>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validationSchema={validationSchema}
      >
        {({ isSubmitting }) => {
          const disabled = isSubmitting

          return (
            <Form>
              <Box sx={{ m: 4 }}>
                {editView ? <EditInterimFeedbackForm /> : <InterimFeedbackForm />}

                <Box sx={{ mt: 2 }}>
                  <Button disabled={disabled} color="primary" variant="contained" type="submit">
                    {t('common:save')}
                  </Button>
                  <Button sx={{ ml: 4 }} color="error" variant="contained" type="button" onClick={onStopEditing}>
                    {t('common:cancel')}
                  </Button>
                </Box>
              </Box>
            </Form>
          )
        }}
      </Formik>
    </Dialog>
  )
}

export default InterimFeedbackEditor
