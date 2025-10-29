import React, { useState } from 'react'
import { differenceInHours } from 'date-fns'
import { Box, Typography, Modal, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { NorButton } from '../../../../components/common/NorButton'
import { getLanguageValue } from '../../../../util/languageUtils'
import { getInterimFeedbackName, getPrimaryCourseName } from '../../../../util/courseIdentifiers'
import { formatClosesAt, getDefaultMessageLanguage } from './utils'
import { TooltipButton } from '../../../../components/common/TooltipButton'
import { FEEDBACK_REMINDER_COOLDOWN } from '../../../../util/common'
import { useSendReminderEmail } from './api'
import useInteractiveMutation from '../../../../hooks/useInteractiveMutation'

const styles = {
  container: {
    position: 'absolute',
    backgroundColor: theme => theme.palette.background.paper,
    boxShadow: theme => theme.shadows[5],
    padding: theme => theme.spacing(4, 5, 3),
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
  },
  subtitle: {
    marginBottom: 5,
    color: '#4c4c4c',
  },
  buttons: {
    marginTop: 20,
    display: 'flex',
    gap: 16,
    justifyContent: 'right',
  },
  textField: {
    whiteSpace: 'pre-line',
    mb: 1,
  },
}

const ReminderEmailModal = ({ open, onClose, feedbackTarget }) => {
  const sendReminderEmail = useSendReminderEmail(feedbackTarget.id)

  const { t, i18n } = useTranslation()

  const { courseUnit, courseRealisation, id, name, feedbackReminderLastSentAt, userCreated } = feedbackTarget
  const isInterimFeedback = userCreated && !courseUnit.userCreated

  const { teachingLanguages } = courseRealisation

  const defaultMessageLanguage = getDefaultMessageLanguage({ teachingLanguages, userLanguage: i18n.language })

  const courseName = isInterimFeedback
    ? getInterimFeedbackName(name, courseUnit.name, t)
    : getPrimaryCourseName(courseUnit, courseRealisation, feedbackTarget)
  const lastSentAt = Date.parse(feedbackReminderLastSentAt)
  const disabled = differenceInHours(Date.now(), lastSentAt) < FEEDBACK_REMINDER_COOLDOWN

  const closesAt = formatClosesAt(feedbackTarget.closesAt)

  const defaultMessage = t(`feedbackTargetResults:${userCreated ? 'customEmailMessage' : 'emailMessage'}`, {
    courseName: getLanguageValue(courseName, defaultMessageLanguage),
    closesAt,
    interpolation: { escapeValue: false },
    lng: defaultMessageLanguage,
  })

  const [reminder, setReminder] = useState(defaultMessage)

  const sendEmailReminder = useInteractiveMutation(() =>
    sendReminderEmail.mutateAsync({
      id,
      data: {
        reminder: reminder === defaultMessage ? '' : reminder,
        courseName,
      },
    })
  )

  const onEmailSend = () => {
    onClose()
    sendEmailReminder()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box mb={2} sx={styles.container}>
        <Typography variant="h6" component="h2">
          {t('feedbackTargetResults:modalTitle')}
        </Typography>
        <Typography variant="body2" component="p" sx={styles.subtitle}>
          {t('feedbackTargetResults:modalSubtitle')}
        </Typography>
        <Typography variant="body2" component="p" sx={styles.subtitle}>
          {t('feedbackTargetResults:emailMessageInfo')}
        </Typography>
        <TextField
          label={t('feedbackTargetResults:writeAMessage')}
          value={reminder}
          onChange={e => setReminder(e.target.value)}
          fullWidth
          multiline
          rows={5}
        />
        <div style={styles.buttons}>
          <NorButton onClick={onClose} color="cancel">
            {t('feedbackTargetResults:cancelReminder')}
          </NorButton>
          <TooltipButton
            onClick={onEmailSend}
            color="primary"
            variant="contained"
            tooltip={t('feedbackTargetResults:reminderDisabled', { cooldown: FEEDBACK_REMINDER_COOLDOWN })}
            disabled={disabled}
          >
            {t('feedbackTargetResults:sendReminderButton')}
          </TooltipButton>
        </div>
      </Box>
    </Modal>
  )
}

export default ReminderEmailModal
