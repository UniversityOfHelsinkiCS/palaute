import { Box, Link as MuiLink } from '@mui/material'
import { KeyboardReturnOutlined } from '@mui/icons-material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

/**
 * Display this with an appropriate message
 * when a Card-like component cannot be shown
 * because of a request error
 */
const ErrorView = ({ message, returnTo = '/feedbacks' }) => {
  const { t } = useTranslation()

  return (
    <Box m={4}>
      {t(message)}
      <Box mb={2} />
      <MuiLink to={returnTo} component={Link}>
        <Box display="flex">
          {t('common:goBack')}
          <Box mr={1} />
          <KeyboardReturnOutlined />
        </Box>
      </MuiLink>
    </Box>
  )
}

export default ErrorView
