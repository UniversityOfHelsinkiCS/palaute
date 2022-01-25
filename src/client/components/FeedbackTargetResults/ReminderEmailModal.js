import React, { useState } from 'react'

import {
  Box,
  Typography,
  Modal,
  Button,
  makeStyles,
  TextField,
} from '@material-ui/core'

import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import apiClient from '../../util/apiClient'
import { formatClosesAt } from './utils'

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4, 5, 3),
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
  },
  title: {
    marginBottom: 10,
  },
  buttons: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'space-around',
  },
  textField: {
    whiteSpace: 'pre-line',
    marginBottom: 10,
  },
}))

const ReminderEmailModal = ({ open, onClose, feedbackTarget }) => {
  const [reminder, setReminder] = useState('')
  const [sent, setSent] = useState(false)
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { t, i18n } = useTranslation()
  const { language } = i18n

  const { courseUnit, id } = feedbackTarget

  const sendEmail = async () => {
    setSent(true)
    onClose()

    try {
      await apiClient.put(`/feedback-targets/${id}/remind-students`, {
        data: { reminder },
      })
    } catch (err) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const closesAt = formatClosesAt(feedbackTarget.closesAt)

  return (
    <Modal open={open} onClose={onClose}>
      <Box mb={2} className={classes.container}>
        <Typography variant="h6" component="h2" className={classes.title}>
          {t('feedbackTargetResults:modalTitle')}
        </Typography>
        <Typography variant="body1" component="p" className={classes.textField}>
          {t('feedbackTargetResults:emailMessage', {
            courseName: courseUnit.name[language],
            closesAt,
          })}
        </Typography>
        <TextField
          label={t('feedbackTargetResults:writeAMessage')}
          value={reminder}
          onChange={(e) => setReminder(e.target.value)}
          fullWidth
        />
        <div className={classes.buttons}>
          <Button
            onClick={sendEmail}
            color="primary"
            variant="contained"
            disabled={sent}
          >
            {t('feedbackTargetResults:sendReminderButton')}
          </Button>
          <Button onClick={onClose} color="secondary" variant="contained">
            {t('feedbackTargetResults:cancelReminder')}
          </Button>
        </div>
      </Box>
    </Modal>
  )
}

export default ReminderEmailModal
