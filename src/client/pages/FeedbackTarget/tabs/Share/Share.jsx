import React, { useState } from 'react'
import QRCode from 'react-qr-code'

import { Box, Chip, Paper, Typography, Alert } from '@mui/material'
import { FileCopyOutlined, Email } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { differenceInHours, format } from 'date-fns'

import { copyLink } from '../../utils'
import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import ReminderEmailModal from './ReminderEmailModal'
import { TooltipButton } from '../../../../components/common/TooltipButton'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import { FEEDBACK_REMINDER_COOLDOWN } from '../../../../util/common'
import { NorButton } from '../../../../components/common/NorButton'
import useFeedbackTargetId from '../../useFeedbackTargetId'

const StudentLinkCopyButton = ({ onClick, label }) => (
  <Box>
    <NorButton icon={<FileCopyOutlined />} color="secondary" onClick={onClick}>
      {label}
    </NorButton>
  </Box>
)

const Share = () => {
  const id = useFeedbackTargetId()

  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const [open, setOpen] = useState(false)
  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const { feedbackTarget } = useFeedbackTargetContext()

  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)

  const lastSentAt = Date.parse(feedbackTarget.feedbackReminderLastSentAt)
  const modalDisabled = differenceInHours(Date.now(), lastSentAt) < FEEDBACK_REMINDER_COOLDOWN
  const formattedLastSentAt = lastSentAt ? format(lastSentAt, 'dd.MM hh.mm') : undefined

  const feedbackLink = `https://${window.location.host}/targets/${id}/feedback`
  const resultsLink = `https://${window.location.host}/targets/${id}/results`

  const handleCopyLink = link => {
    copyLink(link)
    enqueueSnackbar(t('feedbackTargetView:linkCopied'), { variant: 'info' })
  }

  return (
    <Box my={3}>
      <ReminderEmailModal open={open} onClose={closeModal} feedbackTarget={feedbackTarget} />
      {isOpen && (
        <Box mb={2} display="flex" alignItems="center">
          <TooltipButton
            variant="contained"
            color="primary"
            onClick={openModal}
            disabled={modalDisabled}
            startIcon={<Email />}
            tooltip={t('feedbackTargetResults:reminderDisabled', { cooldown: FEEDBACK_REMINDER_COOLDOWN })}
          >
            {t('feedbackTargetResults:sendReminder')}
          </TooltipButton>
          <Box mr={2} />
          <Typography variant="subtitle1" color="textSecondary">
            {formattedLastSentAt && `${t('feedbackTargetResults:reminderLastSent')} ${formattedLastSentAt}`}
          </Typography>
        </Box>
      )}
      {feedbackTarget.userCreated &&
        feedbackTarget.tokenEnrolmentEnabled && ( // @feat Gradu survey
          <Paper>
            <Box p={2}>
              <Chip label="TOKEN ENROLMENT" variant="outlined" />
              <Box display="flex" alignItems="center" mt={1} ml={2}>
                <div>TOKEN ENROLMENT</div>
                <Box mr={2} />
              </Box>
            </Box>
          </Paper>
        )}
      {isEnded && (
        <>
          <Paper>
            <Box p={2}>
              <Chip label={t('feedbackTargetView:studentResultsLinkTitle')} variant="outlined" />
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
          <Chip label={t('feedbackTargetView:studentLinkTitle')} variant="outlined" />
          <Box display="flex" alignItems="center" mt={1} ml={2}>
            <Box fontStyle="italic">
              <Typography>{feedbackLink}</Typography>
            </Box>
            <Box mr={2} />
            <StudentLinkCopyButton onClick={() => handleCopyLink(feedbackLink)} label={t('common:copyToClipBoard')} />
            <Box mr={2} />
          </Box>
        </Box>
      </Paper>
      <Box mt={4} />
      <Paper>
        <Box p={2}>
          <Chip label={t('feedbackTargetView:studentLinkQRTitle')} variant="outlined" />
          <Box p={4}>
            <QRCode value={feedbackLink} />
          </Box>
          <Alert severity="info">{t('feedbackTargetView:qrCodeHelpText')}</Alert>
        </Box>
      </Paper>
    </Box>
  )
}

export default Share
