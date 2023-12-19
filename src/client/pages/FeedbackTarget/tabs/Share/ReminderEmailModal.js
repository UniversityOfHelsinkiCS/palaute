import React, { useState } from 'react'
import { differenceInHours } from 'date-fns'
import { Box, Typography, Modal, Button, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../../util/languageUtils'
import { getInterimFeedbackName, getPrimaryCourseName } from '../../../../util/courseIdentifiers'
import { formatClosesAt } from './utils'
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
    justifyContent: 'space-around',
  },
  textField: {
    whiteSpace: 'pre-line',
    mb: 1,
  },
}

const ReminderEmailModal = ({ open, onClose, feedbackTarget }) => {
  const [reminder, setReminder] = useState('')
  const sendReminderEmail = useSendReminderEmail(feedbackTarget.id)

  const { t, i18n } = useTranslation()

  const { courseUnit, courseRealisation, id, name, feedbackReminderLastSentAt, userCreated } = feedbackTarget
  const isInterimFeedback = userCreated && !courseUnit.userCreated

  const courseName = isInterimFeedback
    ? getInterimFeedbackName(name, courseUnit.name, t)
    : getPrimaryCourseName(courseUnit, courseRealisation, feedbackTarget)
  const lastSentAt = Date.parse(feedbackReminderLastSentAt)
  const disabled = differenceInHours(Date.now(), lastSentAt) < FEEDBACK_REMINDER_COOLDOWN

  const sendEmailReminder = useInteractiveMutation(() =>
    sendReminderEmail.mutateAsync({ id, courseName, data: reminder })
  )

  const onEmailSend = () => {
    onClose()
    sendEmailReminder()
  }

  const closesAt = formatClosesAt(feedbackTarget.closesAt)

  const emailMessage = t(`feedbackTargetResults:${userCreated ? 'customEmailMessage' : 'emailMessage'}`, {
    courseName: getLanguageValue(courseName, i18n.language),
    closesAt,
  })

  return (
    <Modal open={open} onClose={onClose}>
      <Box mb={2} sx={styles.container}>
        <Typography variant="h6" component="h2">
          {t('feedbackTargetResults:modalTitle')}
        </Typography>
        <Typography variant="body2" component="p" sx={styles.subtitle}>
          {t('feedbackTargetResults:modalSubtitle')}
        </Typography>
        <Box mb={4} />
        <Typography variant="body1" component="p" sx={styles.textField}>
          {emailMessage}
        </Typography>
        <Typography variant="body2" component="p" sx={styles.subtitle}>
          {t('feedbackTargetResults:emailMessageInfo')}
        </Typography>
        <Box mb={2} />
        <TextField
          label={t('feedbackTargetResults:writeAMessage')}
          value={reminder}
          onChange={e => setReminder(e.target.value)}
          fullWidth
          multiline
          rows={5}
        />
        <div style={styles.buttons}>
          <TooltipButton
            onClick={onEmailSend}
            color="primary"
            variant="contained"
            tooltip={t('feedbackTargetResults:reminderDisabled', { cooldown: FEEDBACK_REMINDER_COOLDOWN })}
            disabled={disabled}
          >
            {t('feedbackTargetResults:sendReminderButton')}
          </TooltipButton>
          <Button onClick={onClose} color="secondary" variant="contained">
            {t('feedbackTargetResults:cancelReminder')}
          </Button>
        </div>
      </Box>
    </Modal>
  )
}

export default ReminderEmailModal
