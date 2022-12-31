import React from 'react'
import { useParams } from 'react-router'

import useAuthorizedUser from '../../../hooks/useAuthorizedUser'
import useFeedbackTarget from '../../../hooks/useFeedbackTarget'
import useOrganisations from '../../../hooks/useOrganisations'
import { LoadingProgress } from '../../../components/common/LoadingProgress'
import { FeedbackTargetContextProvider } from './FeedbackTargetContext'
import FeedbackTargetContent from './FeedbackTargetContent'
import Error from './Error'

const FeedbackTarget = () => {
  const { id } = useParams()
  const { feedbackTarget, isLoading, isLoadingError, error } = useFeedbackTarget(id, { retry: 0 })
  const courseUnit = feedbackTarget?.courseUnit

  const { authorizedUser } = useAuthorizedUser()

  const { organisations, isLoading: organisationsLoading } = useOrganisations()
  const organisation =
    isLoading || organisationsLoading || !courseUnit
      ? null
      : organisations?.find(org => courseUnit.organisations[0].id === org.id)

  if (isLoading) {
    return <LoadingProgress />
  }

  if (isLoadingError || !feedbackTarget) {
    return <Error error={error} />
  }

  return (
    <FeedbackTargetContextProvider
      id={id}
      isAdmin={authorizedUser?.isAdmin}
      accessStatus={feedbackTarget?.accessStatus}
      feedbackTarget={feedbackTarget}
      organisation={organisation}
    >
      <FeedbackTargetContent />
    </FeedbackTargetContextProvider>
  )
}

export default FeedbackTarget
