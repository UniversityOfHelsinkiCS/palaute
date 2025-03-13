import React from 'react'
import { useParams } from 'react-router'

import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useOrganisations from '../../hooks/useOrganisations'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { FeedbackTargetContextProvider } from './FeedbackTargetContext'
import FeedbackTargetContent from './FeedbackTargetContent'
import Error from './Error'

const FeedbackTarget = () => {
  const { id } = useParams()
  const { feedbackTarget, isLoading, isLoadingError, error } = useFeedbackTarget(id, { retry: 0 })
  const courseUnit = feedbackTarget?.courseUnit

  const { authorizedUser } = useAuthorizedUser()

  const { organisations, isLoading: organisationsLoading } = useOrganisations()
  function getPriority(org) {
    let weight = 0
    if (org.access.admin) {
      weight += 100
    }
    if (org.access.write) {
      weight += 10
    }
    if (org.access.read) {
      weight += 1
    }
    return weight
  }

  const organisation =
    isLoading || organisationsLoading || !courseUnit
      ? null
      : organisations
          ?.filter(org => courseUnit.organisations.map(o => o.id)?.includes(org.id))
          ?.sort((a, b) => getPriority(b) - getPriority(a)) // admin, write, read
          ?.at(0)

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
      feedbackTarget={feedbackTarget}
      organisation={organisation}
    >
      <FeedbackTargetContent />
    </FeedbackTargetContextProvider>
  )
}

export default FeedbackTarget
