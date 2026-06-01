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
  const formattedLastSentAt = lastSentAt ? format(lastSentAt, 'dd.MM. HH.mm') : undefined

  const feedbackLink = `https://${window.location.host}/targets/${id}/feedback`
  const resultsLink = `https://${window.location.host}/targets/${id}/results`

  const handleCopyLink = link => {
    copyLink(link)
    enqueueSnackbar(t('feedbackTargetView:linkCopied'), { variant: 'info' })
  }

  return (
    <Box id="feedback-target-tab-content" sx={{ my: 3 }}>
      <ReminderEmailModal open={open} onClose={closeModal} feedbackTarget={feedbackTarget} />
      {isOpen && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
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
          {formattedLastSentAt && (
            <Typography component="p" variant="subtitle1" color="textSecondary">
              {`${t('feedbackTargetResults:reminderLastSent')} ${formattedLastSentAt}. ${t(
                'feedbackTargetResults:reminderCooldownInfo',
                {
                  cooldown: FEEDBACK_REMINDER_COOLDOWN,
                }
              )}`}
            </Typography>
          )}
        </Box>
      )}
      {feedbackTarget.userCreated &&
        feedbackTarget.tokenEnrolmentEnabled && ( // @feat Gradu survey
          <Paper>
            <Box sx={{ p: 2 }}>
              <Chip label="TOKEN ENROLMENT" variant="outlined" />
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, ml: 2 }}>
                <div>TOKEN ENROLMENT</div>
                <Box sx={{ mr: 2 }} />
              </Box>
            </Box>
          </Paper>
        )}
      {isEnded && (
        <>
          <Paper>
            <Box sx={{ p: 2 }}>
              <Chip label={t('feedbackTargetView:studentResultsLinkTitle')} variant="outlined" />
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, ml: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ fontStyle: 'italic', minWidth: 0, mr: 2 }}>
                  <Typography sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{resultsLink}</Typography>
                </Box>
                <StudentLinkCopyButton
                  onClick={() => handleCopyLink(resultsLink)}
                  label={t('common:copyToClipBoard')}
                  sx={{ flexShrink: 0 }}
                />
              </Box>
            </Box>
          </Paper>
          <Box sx={{ mt: 4 }} />
        </>
      )}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Chip label={t('feedbackTargetView:studentLinkTitle')} variant="outlined" />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, ml: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ fontStyle: 'italic', minWidth: 0, mr: 2 }}>
              <Typography sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{feedbackLink}</Typography>
            </Box>
            <StudentLinkCopyButton
              onClick={() => handleCopyLink(feedbackLink)}
              label={t('common:copyToClipBoard')}
              sx={{ flexShrink: 0 }}
            />
          </Box>
        </Box>
      </Paper>
      <Box sx={{ mt: 4 }} />
      <Paper>
        <Box sx={{ p: 2 }}>
          <Chip label={t('feedbackTargetView:studentLinkQRTitle')} variant="outlined" />
          <Box sx={{ p: 4, display: 'flex', overflow: 'auto' }}>
            <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
              <QRCode value={feedbackLink} />
            </Box>
          </Box>
          <Alert severity="info">{t('feedbackTargetView:qrCodeHelpText')}</Alert>
        </Box>
      </Paper>
    </Box>
  )
}

export default Share
