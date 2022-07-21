import React, { useState } from 'react'
import { useHistory } from 'react-router'
import { Button, Paper, Typography, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@mui/icons-material/Close'
import { useSnackbar } from 'notistack'

import apiClient from '../../util/apiClient'

const styles = {
  container: {
    margin: 2,
    background: '#ffe06d',
    borderRadius: '5px',
    padding: 1.5,
  },
  button: {
    marginTop: 1,
  },
  heading: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  close: {
    color: 'white',
    background: 'red',
    padding: 0,
    minWidth: 50,
    '&:hover': {
      background: '#c80000',
    },
  },
}

const NorppaFeedbackBanner = () => {
  const [visible, setVisible] = useState(true)
  const { t } = useTranslation()
  const history = useHistory()

  const { enqueueSnackbar } = useSnackbar()

  const saveVisibility = async () => {
    try {
      await apiClient.put(`/norppa-feedback/hide`)
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const handleClick = () => {
    setVisible(false)
    saveVisibility()
    history.push('/norppa-feedback')
  }

  const handleClose = () => {
    setVisible(false)
    saveVisibility()
  }

  return (
    visible && (
      <Paper sx={styles.container}>
        <Box sx={styles.heading}>
          <Typography variant="h6" component="h6">
            {t('norppaFeedback:bannerTitle')}
          </Typography>
          <Button onClick={handleClose} sx={styles.close}>
            <CloseIcon />
          </Button>
        </Box>
        <Typography variant="body1" component="p">
          {t('norppaFeedback:feedbackBanner')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleClick}
          sx={styles.button}
        >
          {t('norppaFeedback:title')}
        </Button>
      </Paper>
    )
  )
}

export default NorppaFeedbackBanner
