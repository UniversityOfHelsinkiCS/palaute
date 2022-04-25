import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import QRCode from 'react-qr-code'

import { Box } from '@material-ui/core'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { LoadingProgress } from '../LoadingProgress'

const FeedbackTargetResults = () => {
  const { id } = useParams()

  const { authorizedUser, isLoading: authorizedUserLoading } =
    useAuthorizedUser()

  const isAdminUser = authorizedUser?.isAdmin ?? false

  const { feedbackTarget, isLoading: feedbackTargetIsLoading } =
    useFeedbackTarget(id)

  const isLoading = feedbackTargetIsLoading || authorizedUserLoading

  if (isLoading) {
    return <LoadingProgress />
  }

  const isOpen = feedbackTargetIsOpen(feedbackTarget)

  if (!isOpen && !isAdminUser) {
    return <Redirect to={`/targets/${feedbackTarget.id}/feedback`} />
  }

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        margin={5}
        marginTop={5}
        marginBottom={5}
      >
        <QRCode value={`${window.location.host}/targets/${id}/feedback`} />
      </Box>
    </>
  )
}

export default FeedbackTargetResults
