import React, { useState } from 'react'
import { useHistory } from 'react-router'
import { Button, Paper, Typography, makeStyles, Box } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@material-ui/icons/Close'
import { useSnackbar } from 'notistack'

import apiClient from '../../util/apiClient'

const useStyles = makeStyles(() => ({
  container: {
    margin: 10,
    background: '#ffe06d',
    borderRadius: '5px',
    padding: 15,
  },
  button: {
    marginTop: 10,
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
}))

const NorppaFeedbackBanner = () => {
  const [visible, setVisible] = useState(true)
  const classes = useStyles()
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
      <Paper className={classes.container}>
        <Box className={classes.heading}>
          <Typography variant="h6" component="h6">
            {t('norppaFeedback:bannerTitle')}
          </Typography>
          <Button onClick={handleClose} className={classes.close}>
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
          className={classes.button}
        >
          {t('norppaFeedback:title')}
        </Button>
      </Paper>
    )
  )
}

export default NorppaFeedbackBanner
