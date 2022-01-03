import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import QRCode from 'react-qr-code'

import { Box, CircularProgress } from '@material-ui/core'

import { basePath } from '../../../config'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useFeedbackTargetFeedbacks from '../../hooks/useFeedbackTargetFeedbacks'

import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'

const FeedbackTargetResults = () => {
  const { id } = useParams()

  const { feedbackTarget, isLoading: feedbackTargetIsLoading } =
    useFeedbackTarget(id)

  const { feedbackTargetData, isLoading: feedbacksIsLoading } =
    useFeedbackTargetFeedbacks(id)

  const isLoading = feedbackTargetIsLoading || feedbacksIsLoading

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  if (!feedbackTarget || !feedbackTargetData) {
    return <Redirect to="/" />
  }

  const isOpen = feedbackTargetIsOpen(feedbackTarget)

  if (!isOpen) {
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
        <QRCode value={`${basePath}/targets/${id}/feedback`} />
      </Box>
    </>
  )
}

export default FeedbackTargetResults
