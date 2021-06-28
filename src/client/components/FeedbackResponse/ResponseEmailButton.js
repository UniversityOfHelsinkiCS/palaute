import React, { useState } from 'react'
import { Button } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import apiClient from '../../util/apiClient'

const ResponseEmailButton = ({ disabled, feedbackTargetId }) => {
  const [sent, setSent] = useState(false)
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const sendEmail = async () => {
    setSent(true)
    try {
      await apiClient.put(
        `/feedback-targets/${feedbackTargetId}/notify-students`,
        { data: { feedbackResponseEmailSent: true } },
      )
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (err) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <Button
      disabled={disabled || sent}
      type="button"
      variant="contained"
      color="primary"
      onClick={sendEmail}
    >
      {t('feedbackResponse:sendEmail')}
    </Button>
  )
}

export default ResponseEmailButton
