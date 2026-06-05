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

const ShareItem = ({ chipLabel, buttonLabel, linkText, copyLink }) => (
  <Paper sx={{ my: 4 }}>
    <Box sx={{ p: 2 }}>
      <Chip label={chipLabel} variant="outlined" />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, ml: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ fontStyle: 'italic', minWidth: 0, mr: 2 }}>
          <Typography sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{linkText}</Typography>
        </Box>
        <Box>
          <NorButton
            icon={<FileCopyOutlined />}
            color="secondary"
            onClick={() => copyLink(linkText)}
            aria-label={`${buttonLabel}: ${chipLabel}`}
          >
            {buttonLabel}
          </NorButton>
        </Box>
      </Box>
    </Box>
  </Paper>
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
      {isEnded && (
        <ShareItem
          chipLabel={t('feedbackTargetView:studentResultsLinkTitle')}
          buttonLabel={t('common:copyToClipBoard')}
          linkText={resultsLink}
          copyLink={handleCopyLink}
        />
      )}
      <ShareItem
        chipLabel={t('feedbackTargetView:studentLinkTitle')}
        buttonLabel={t('common:copyToClipBoard')}
        linkText={feedbackLink}
        copyLink={handleCopyLink}
      />
      <Paper sx={{ my: 4 }}>
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
