import React, { useState } from 'react'
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
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import ReminderEmailModal from './ReminderEmailModal'

const StudentLinkCopyButton = ({ onClick, label }) => (
  <Box>
    <Button startIcon={<FileCopyOutlined />} color="primary" onClick={onClick}>
      {label}
    </Button>
  </Box>
)

const FeedbackTargetLinks = () => {
  const [open, setOpen] = useState(false)
  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const { id } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const { feedbackTarget, isLoading } = useFeedbackTarget(id)

  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)

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
      <ReminderEmailModal
        open={open}
        onClose={closeModal}
        feedbackTarget={feedbackTarget}
      />
      {isOpen && (
        <Box mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={openModal}
            style={{ marginTop: 10 }}
            disabled={feedbackTarget.feedbackReminderEmailToStudentsSent}
          >
            {t('feedbackTargetResults:sendReminder')}
          </Button>
        </Box>
      )}
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
