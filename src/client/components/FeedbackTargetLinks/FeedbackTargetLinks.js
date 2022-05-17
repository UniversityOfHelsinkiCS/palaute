import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import QRCode from 'react-qr-code'

import {
  Box,
  Button,
  Chip,
  FilledInput,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core'
import { FileCopyOutlined } from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { LoadingProgress } from '../LoadingProgress'
import { copyLink } from '../FeedbackTargetView/utils'
import Alert from '../Alert'

const StudentLinkCopyButton = ({ onClick, label }) => (
  <Box>
    <Button startIcon={<FileCopyOutlined />} color="primary" onClick={onClick}>
      {label}
    </Button>
  </Box>
)

const FeedbackTargetLinks = () => {
  const { id } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const { t, i18n } = useTranslation()

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

  const link = `${window.location.host}/targets/${id}/feedback`

  const handleCopyLink = () => {
    copyLink(feedbackTarget)
    enqueueSnackbar(t('feedbackTargetView:linkCopied'), { variant: 'info' })
  }

  if (!isOpen && !isAdminUser) {
    return <Redirect to={`/targets/${feedbackTarget.id}/feedback`} />
  }

  return (
    <Box display="flex" flexDirection="column" margin={3}>
      <Paper>
        <Box p={2}>
          <Chip
            label={t('feedbackTargetView:studentLinkTitle')}
            variant="outlined"
          />
          <Box
            fontStyle="italic"
            display="flex"
            alignItems="center"
            mt={1}
            ml={2}
          >
            <Typography>{link}</Typography>
            <Box mr={2} />
            <StudentLinkCopyButton
              onClick={handleCopyLink}
              label={t('common:copyToClipBoard')}
            />
          </Box>
        </Box>
      </Paper>
      <Box mt={4} />
      <Paper>
        <Box p={2}>
          <Chip
            label={t('feedbackTargetView:studentLinkQRTitle')}
            variant="outlined"
          />
          <Box p={4}>
            <QRCode value={link} />
          </Box>
          <Alert severity="info">
            {t('feedbackTargetView:qrCodeHelpText')}
          </Alert>
        </Box>
      </Paper>
    </Box>
  )
}

export default FeedbackTargetLinks
