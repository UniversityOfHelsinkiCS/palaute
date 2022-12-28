import { Checkbox, FormControlLabel } from '@mui/material'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import ErrorView from '../../../components/common/ErrorView'
import apiClient from '../../../util/apiClient'
import errors from '../../../util/errorMessage'

const Error = ({ error }) => {
  const [enabled, setEnabled] = React.useState(
    Boolean(error.response?.data?.enabled),
  )
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { id } = useParams()

  // todo refactor into mutation
  const onSubmit = async () => {
    const res = await apiClient.put(
      `/feedback-targets/${id}/enrolment-notification`,
      { enabled: !enabled },
    )
    const { enabled: newEnabled, email } = res.data
    setEnabled(newEnabled)
    enqueueSnackbar(
      t(
        `feedbackTargetView:${
          newEnabled ? 'notificationEnabled' : 'notificationDisabled'
        }`,
        { email },
      ),
      { autoHideDuration: 10_000 },
    )
  }

  return (
    <ErrorView
      message={errors.getFeedbackTargetError(error)}
      response={error.response}
    >
      {error.response?.status === 403 && (
        <FormControlLabel
          control={<Checkbox checked={enabled} onChange={onSubmit} />}
          label={t('feedbackTargetView:notifyOnEnrolment')}
        />
      )}
    </ErrorView>
  )
}

export default Error
