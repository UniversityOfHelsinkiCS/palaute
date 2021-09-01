import React, { useState, useRef } from 'react'
import { Box, Button } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'

import FormikDatePicker from '../FormikDatePicker'
import Alert from '../Alert'
import OpenFeedbackImmediatelyDialog from './OpenFeedbackImmediatelyDialog'
import { validateFeedbackPeriod, requiresSubmitConfirmation } from './utils'

const FeedbackPeriodForm = ({
  onSubmit = () => {},
  onOpenImmediately = () => {},
  initialValues,
}) => {
  const { t } = useTranslation()
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const submitValuesRef = useRef()
  const warningOriginRef = useRef()

  const handleOpenWarningDialog = () => setWarningDialogOpen(true)

  const handleCloseWarningDialog = () => setWarningDialogOpen(false)

  const handleConfirmWarning = () => {
    const { current: warningOrigin } = warningOriginRef
    const { current: submitValues } = submitValuesRef

    if (warningOrigin === 'formSubmit') {
      onSubmit(submitValues)
    } else {
      onOpenImmediately()
    }

    handleCloseWarningDialog()
  }

  const handleSubmit = (values) => {
    submitValuesRef.current = values
    warningOriginRef.current = 'formSubmit'

    if (requiresSubmitConfirmation(values)) {
      handleOpenWarningDialog()
    } else {
      onSubmit(values)
    }
  }

  return (
    <>
      <OpenFeedbackImmediatelyDialog
        open={warningDialogOpen}
        onClose={handleCloseWarningDialog}
        onConfirm={handleConfirmWarning}
      />
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={validateFeedbackPeriod}
        validateOnChange={false}
      >
        {() => (
          <Form>
            <Alert severity="warning">
              {t('editFeedbackTarget:warningAboutOpeningCourse')}
            </Alert>
            <Box mb={1}>
              <FormikDatePicker
                name="opensAt"
                label={t('editFeedbackTarget:opensAt')}
                fullWidth
                disablePast
              />
            </Box>
            <Box mb={2}>
              <FormikDatePicker
                name="closesAt"
                label={t('editFeedbackTarget:closesAt')}
                fullWidth
                disablePast
              />
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Button variant="contained" color="primary" type="submit">
                {t('save')}
              </Button>

              <Button
                variant="contained"
                color="secondary"
                onClick={handleOpenWarningDialog}
              >
                {t('editFeedbackTarget:openImmediately')}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default FeedbackPeriodForm
