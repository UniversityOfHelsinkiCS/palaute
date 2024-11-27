import React from 'react'
import { Button, Box, Dialog, Grid2 as Grid, DialogTitle } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'

import FormikDatePicker from '../../../../components/common/FormikDatePicker'
import FormikLocalesFieldEditor from '../../../../components/common/FormikLocalesFieldEditor'

const InterimFeedbackForm = () => {
  const { t } = useTranslation()

  return (
    <Grid spacing={4} container>
      <FormikLocalesFieldEditor name="name" localesLabelString="interimFeedback:newSurveyName" />

      <Grid size={{ xs: 12, sm: 12, md: 6 }}>
        <FormikDatePicker name="startDate" label={t('interimFeedback:startDate')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6 }}>
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

      <Grid size={{ xs: 12, sm: 12, md: 6 }}>
        <FormikDatePicker name="startDate" label={t('interimFeedback:startDate')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6 }}>
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
      <DialogTitle data-cy="interim-feedback-editor-title">{title}</DialogTitle>
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
                  <Button
                    data-cy="interim-feedback-editor-save"
                    disabled={disabled}
                    color="primary"
                    variant="contained"
                    type="submit"
                  >
                    {t('common:save')}
                  </Button>
                  <Button
                    data-cy="interim-feedback-editor-cancel"
                    sx={{ ml: 4 }}
                    color="error"
                    variant="contained"
                    type="button"
                    onClick={onStopEditing}
                  >
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
