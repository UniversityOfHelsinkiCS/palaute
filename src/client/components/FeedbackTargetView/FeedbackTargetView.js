import React from 'react'
import { Checkbox, FormControlLabel } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import apiClient from '../../util/apiClient'

import errors from '../../util/errorMessage'
import ErrorView from '../common/ErrorView'

import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useOrganisations from '../../hooks/useOrganisations'
import { LoadingProgress } from '../common/LoadingProgress'
import { FeedbackTargetContextProvider } from './FeedbackTargetContext'
import FeedbackTargetViewContent from './FeedbackTargetViewContent'

const ErrorComponent = ({ error }) => {
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

const FeedbackTargetView = () => {
  const { id } = useParams()
  const { feedbackTarget, isLoading, isLoadingError, error } =
    useFeedbackTarget(id, { retry: 0 })
  const courseUnit = feedbackTarget?.courseUnit

  const { authorizedUser } = useAuthorizedUser()

  const { organisations, isLoading: organisationsLoading } = useOrganisations()
  const organisation =
    isLoading || organisationsLoading || !courseUnit
      ? null
      : organisations?.find((org) => courseUnit.organisations[0].id === org.id)

  if (isLoading) {
    return <LoadingProgress />
  }

  if (isLoadingError || !feedbackTarget) {
    return <ErrorComponent error={error} />
  }

  return (
    <FeedbackTargetContextProvider
      id={id}
      isAdmin={authorizedUser?.isAdmin}
      accessStatus={feedbackTarget?.accessStatus}
      feedbackTarget={feedbackTarget}
      organisation={organisation}
    >
      <FeedbackTargetViewContent />
    </FeedbackTargetContextProvider>
  )
}

export default FeedbackTargetView
