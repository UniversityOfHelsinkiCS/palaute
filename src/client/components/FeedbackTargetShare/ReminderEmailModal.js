import React, { useState } from 'react'
import { useMutation } from 'react-query'
import { differenceInHours } from 'date-fns'

import { Box, Typography, Modal, Button, TextField } from '@mui/material'

import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import apiClient from '../../util/apiClient'
import { formatClosesAt } from './utils'
import queryClient from '../../util/queryClient'
import { TooltipButton } from '../common/TooltipButton'

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
    marginBottom: 5,
  },
}

const useSendReminderEmail = () => {
  const mutationFn = async ({ id, data }) =>
    apiClient.put(`/feedback-targets/${id}/remind-students`, {
      data: { data },
    })

  const mutation = useMutation(mutationFn, {
    onSuccess: (response, variables) => {
      queryClient.setQueryData(['feedbackTarget', String(variables.id)], feedbackTarget => ({
        ...feedbackTarget,
        ...response.data,
      }))
    },
  })

  return mutation
}

const ReminderEmailModal = ({ open, onClose, feedbackTarget }) => {
  const [reminder, setReminder] = useState('')
  const { enqueueSnackbar } = useSnackbar()
  const sendReminderEmail = useSendReminderEmail(feedbackTarget.id)

  const { t, i18n } = useTranslation()
  const { language } = i18n

  const { courseUnit, id, feedbackReminderLastSentAt } = feedbackTarget
  const lastSentAt = Date.parse(feedbackReminderLastSentAt)
  const disabled = differenceInHours(Date.now(), lastSentAt) < 24

  const sendEmail = async () => {
    onClose()

    try {
      await sendReminderEmail.mutateAsync({ id, data: reminder })
      enqueueSnackbar(t('feedbackTargetResults:emailSent'), {
        variant: 'success',
      })
    } catch (err) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const closesAt = formatClosesAt(feedbackTarget.closesAt)

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
          {t('feedbackTargetResults:emailMessage', {
            courseName: courseUnit.name[language],
            closesAt,
          })}
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
            onClick={sendEmail}
            color="primary"
            variant="contained"
            tooltip={t('feedbackTargetResults:reminderDisabled')}
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
