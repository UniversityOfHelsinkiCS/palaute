import React from 'react'
import { Box, Button } from '@mui/material'

const ErrorCausingComponent = () => {
  const THIS_IS_A_TEST_ERROR_CAUSED_BY_ADMIN_PLEASE_IGNORE = undefined

  return <div>{THIS_IS_A_TEST_ERROR_CAUSED_BY_ADMIN_PLEASE_IGNORE()}</div>
}

const CrashDebug = () => {
  const [err, setErr] = React.useState(false)

  return (
    <Box m="1rem" fontSize={12} maxWidth="10rem">
      This button throws an error. It may cause sentry alerts to developers so please do not spam.
      <Button onClick={() => setErr(true)} variant="outlined" color="error" size="small" data-cy="errorButton">
        Throw error
      </Button>
      {err && <ErrorCausingComponent />}
    </Box>
  )
}

export default CrashDebug
