import { Alert, Box, Link as MuiLink, Typography } from '@mui/material'
import { KeyboardReturnOutlined } from '@mui/icons-material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

/**
 * Display this with an appropriate message
 * when a component cannot be shown
 * because of a request error
 */
const ErrorView = ({ message, response, returnTo = '/feedbacks' }) => {
  const { t } = useTranslation()

  const supportEmail = 'coursefeedback@helsinki.fi'

  return (
    <Box m={4}>
      <Typography variant="body1">{t(message)}</Typography>
      {response && (
        <Box>
          <Typography color="textSecondary" variant="subtitle1">
            {response.status} {response.statusText}
          </Typography>
        </Box>
      )}
      <Box mb={3} />
      <MuiLink to={returnTo} component={Link} underline="hover">
        <Box display="flex">
          {t('common:goBack')}
          <Box mr={1} />
          <KeyboardReturnOutlined />
        </Box>
      </MuiLink>
      <Box mt={4}>
        <Alert variant="standard" severity="info">
          {t('common:supportContact')}
          <MuiLink href={`mailto:${supportEmail}`} underline="hover">
            {supportEmail}
          </MuiLink>
        </Alert>
      </Box>
    </Box>
  )
}

export default ErrorView
