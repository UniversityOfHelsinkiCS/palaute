import { FileCopyOutlined, Email } from '@mui/icons-material'
import { Box, Typography, Alert } from '@mui/material'
import { differenceInHours, format } from 'date-fns'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'

import { NorButton } from '../../../../components/common/NorButton'
import { TooltipButton } from '../../../../components/common/TooltipButton'
import { FEEDBACK_REMINDER_COOLDOWN } from '../../../../util/common'
import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import useFeedbackTargetId from '../../useFeedbackTargetId'
import { copyLink } from '../../utils'
import ReminderEmailModal from './ReminderEmailModal'

const SectionHeading = ({ children, component = 'h4' }) => (
  <Typography component={component} variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
    {children}
  </Typography>
)

export const ShareItem = ({ title, buttonLabel, linkText, copyLink, headingComponent }) => (
  <Box>
    <SectionHeading component={headingComponent}>{title}</SectionHeading>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{ fontStyle: 'italic', minWidth: 0, maxWidth: '100%' }}>
        <Typography sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{linkText}</Typography>
      </Box>
      <Box>
        <NorButton
          icon={<FileCopyOutlined />}
          color="secondary"
          onClick={() => copyLink(linkText)}
          aria-label={`${buttonLabel}: ${title}`}
        >
          {buttonLabel}
        </NorButton>
      </Box>
    </Box>
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
    <Box id="feedback-target-tab-content">
      <ReminderEmailModal open={open} onClose={closeModal} feedbackTarget={feedbackTarget} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { md: '1fr 1fr' },
          gap: 6,
          alignItems: 'start',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {isOpen && (
            <Box>
              <SectionHeading>{t('feedbackTargetView:reminderEmailTitle')}</SectionHeading>
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
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
            </Box>
          )}
          {isEnded && (
            <ShareItem
              title={t('feedbackTargetView:studentResultsLinkTitle')}
              buttonLabel={t('common:copyToClipBoard')}
              linkText={resultsLink}
              copyLink={handleCopyLink}
            />
          )}
          <ShareItem
            title={t('feedbackTargetView:studentLinkTitle')}
            buttonLabel={t('common:copyToClipBoard')}
            linkText={feedbackLink}
            copyLink={handleCopyLink}
          />
        </Box>
        <Box>
          <SectionHeading>{t('feedbackTargetView:studentLinkQRTitle')}</SectionHeading>
          <Box sx={{ pt: 2, pb: 3, display: 'flex', overflow: 'auto' }}>
            <Box sx={{ ml: 2, maxWidth: '100%', overflow: 'hidden', '& svg': { display: 'block' } }}>
              <QRCode value={feedbackLink} />
            </Box>
          </Box>
          <Alert severity="info">{t('feedbackTargetView:qrCodeHelpText')}</Alert>
        </Box>
      </Box>
    </Box>
  )
}

export default Share
