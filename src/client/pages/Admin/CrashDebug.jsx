import React from 'react'
import { Box } from '@mui/material'
import * as Sentry from '@sentry/browser'
import { NorButton } from '../../components/common/NorButton'

const ErrorCausingComponent = () => {
  const THIS_IS_A_TEST_ERROR_CAUSED_BY_ADMIN_PLEASE_IGNORE = undefined

  return <div>{THIS_IS_A_TEST_ERROR_CAUSED_BY_ADMIN_PLEASE_IGNORE()}</div>
}

const CrashDebug = () => {
  const [err, setErr] = React.useState(false)

  return (
    <Box>
      <NorButton onClick={() => setErr(true)} color="error" size="small" data-cy="errorButton">
        Throw error
      </NorButton>
      <NorButton
        onClick={() => Sentry.captureMessage('Greetings from admin panel! This is a drill.')}
        color="success"
        size="small"
        data-cy="successButton"
      >
        Test sentry message
      </NorButton>
      {err && <ErrorCausingComponent />}
    </Box>
  )
}

export default CrashDebug
