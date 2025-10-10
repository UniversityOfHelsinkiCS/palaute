import React from 'react'
import { Box, Dialog, Grid2 as Grid, DialogTitle } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'

import FormikDatePicker from '../../../../components/common/FormikDatePicker'
import FormikLocalesFieldEditor from '../../../../components/common/FormikLocalesFieldEditor'
import { NorButton } from '../../../../components/common/NorButton'

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

const InterimFeedbackEditor = ({ title, initialValues, validationSchema, handleSubmit, editing, onStopEditing }) => {
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
                <InterimFeedbackForm />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'right', gap: 2 }}>
                  <NorButton data-cy="interim-feedback-editor-cancel" color="cancel" onClick={onStopEditing}>
                    {t('common:cancel')}
                  </NorButton>
                  <NorButton data-cy="interim-feedback-editor-save" disabled={disabled} color="primary" type="submit">
                    {t('common:save')}
                  </NorButton>
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
