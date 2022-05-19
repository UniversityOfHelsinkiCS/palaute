import React from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'react-qr-code'

import { Box, Button, Chip, Paper, Typography } from '@material-ui/core'
import { FileCopyOutlined } from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import { LoadingProgress } from '../LoadingProgress'
import { copyLink } from '../FeedbackTargetView/utils'
import Alert from '../Alert'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'

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

  const { feedbackTarget, isLoading } = useFeedbackTarget(id)

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)

  if (isLoading) {
    return <LoadingProgress />
  }

  const feedbackLink = `${window.location.host}/targets/${id}/feedback`
  const resultsLink = `${window.location.host}/targets/${id}/results`

  const handleCopyLink = (link) => {
    copyLink(link)
    enqueueSnackbar(t('feedbackTargetView:linkCopied'), { variant: 'info' })
  }

  return (
    <Box display="flex" flexDirection="column" margin={3}>
      {isEnded && (
        <>
          <Paper>
            <Box p={2}>
              <Chip
                label={t('feedbackTargetView:studentResultsLinkTitle')}
                variant="outlined"
              />
              <Box display="flex" alignItems="center" mt={1} ml={2}>
                <Box fontStyle="italic">
                  <Typography>{resultsLink}</Typography>
                </Box>
                <Box mr={2} />
                <StudentLinkCopyButton
                  onClick={() => handleCopyLink(resultsLink)}
                  label={t('common:copyToClipBoard')}
                />
                <Box mr={2} />
              </Box>
            </Box>
          </Paper>
          <Box mt={4} />
        </>
      )}
      <Paper>
        <Box p={2}>
          <Chip
            label={t('feedbackTargetView:studentLinkTitle')}
            variant="outlined"
          />
          <Box display="flex" alignItems="center" mt={1} ml={2}>
            <Box fontStyle="italic">
              <Typography>{feedbackLink}</Typography>
            </Box>
            <Box mr={2} />
            <StudentLinkCopyButton
              onClick={() => handleCopyLink(feedbackLink)}
              label={t('common:copyToClipBoard')}
            />
            <Box mr={2} />
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
            <QRCode value={feedbackLink} />
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
