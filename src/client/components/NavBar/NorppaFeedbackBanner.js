import React, { useState } from 'react'
import { Button, Paper, Typography, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@mui/icons-material/Close'
import { useSnackbar } from 'notistack'
import { Link } from 'react-router-dom'

import apiClient from '../../util/apiClient'

const styles = {
  container: {
    zIndex: (theme) => theme.zIndex.drawer + 2,
    background: (theme) => theme.palette.secondary.main,
    padding: '0.3rem',
    paddingLeft: '2rem',
    paddingRight: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 1,
  },
  close: {
    color: 'black',
    background: (theme) => theme.palette.secondary.main,
    padding: '0.2rem',
    marginLeft: '2rem',
    minWidth: 50,
    '&:hover': {
      background: (theme) => theme.palette.secondary.light,
    },
  },
}

const NorppaFeedbackBanner = () => {
  const [visible, setVisible] = useState(true)
  const { t } = useTranslation()

  const { enqueueSnackbar } = useSnackbar()

  const saveVisibility = async () => {
    try {
      await apiClient.put(`/norppa-feedback/hide`)
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const handleClose = () => {
    setVisible(false)
    saveVisibility()
  }

  return (
    visible && (
      <Paper sx={styles.container} elevation={0}>
        <Typography variant="h6" component="h6">
          {t('norppaFeedback:bannerTitle')}
        </Typography>
        <Box mr="1rem" />
        <Link to="/norppa-feedback" variant="body1" onClick={handleClose}>
          {t('norppaFeedback:feedbackBanner')}
        </Link>
        <Button onClick={handleClose} sx={styles.close}>
          <CloseIcon />
        </Button>
      </Paper>
    )
  )
}

export default NorppaFeedbackBanner
