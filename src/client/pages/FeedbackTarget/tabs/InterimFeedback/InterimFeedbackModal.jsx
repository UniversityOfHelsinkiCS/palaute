import React, { useState } from 'react'

import { useParams, useNavigate } from 'react-router-dom'

import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Dialog, Box, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import useAuthorizedUser from '../../../../hooks/useAuthorizedUser'

import useOrganisations from '../../../../hooks/useOrganisations'
import useFeedbackTarget from '../../../../hooks/useFeedbackTarget'

import { FeedbackTargetContextProvider } from '../../FeedbackTargetContext'
// eslint-disable-next-line import/no-cycle
import FeedbackTargetContent from '../../FeedbackTargetContent'

const InterimFeedbackModal = () => {
  const navigate = useNavigate()
  const { id: parentId, interimFeedbackId } = useParams()
  const [showInterimFeedback, setShowInterimFeedback] = useState(true)

  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()

  const { feedbackTarget, isLoading: feedbackLoading } = useFeedbackTarget(interimFeedbackId, { retry: 0 })
  const { organisations, isLoading: organisationsLoading } = useOrganisations()
  const organisation =
    feedbackLoading || organisationsLoading || !feedbackTarget?.courseUnit
      ? null
      : organisations?.find(org => feedbackTarget?.courseUnit?.organisations[0]?.id === org.id)

  const handleClose = () => {
    setShowInterimFeedback(prev => !prev)
    navigate(`/targets/${parentId}/interim-feedback`)
  }

  if (organisationsLoading || isUserLoading || feedbackLoading) return null

  return (
    <Dialog
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xl"
      scroll="paper"
      open={showInterimFeedback}
      onClose={handleClose}
    >
      <IconButton
        data-cy="interim-feedback-modal-close-button"
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box sx={{ m: 4 }}>
        <FeedbackTargetContextProvider
          id={interimFeedbackId}
          isAdmin={authorizedUser?.isAdmin}
          feedbackTarget={feedbackTarget}
          organisation={organisation}
        >
          <FeedbackTargetContent />
        </FeedbackTargetContextProvider>
      </Box>
    </Dialog>
  )
}

export default InterimFeedbackModal
