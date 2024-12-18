import React from 'react'
import { Box, Button } from '@mui/material'

const ErrorCausingComponent = () => {
  const THIS_IS_A_TEST_ERROR_CAUSED_BY_ADMIN_PLEASE_IGNORE = undefined

  return <div>{THIS_IS_A_TEST_ERROR_CAUSED_BY_ADMIN_PLEASE_IGNORE()}</div>
}

const CrashDebug = () => {
  const [err, setErr] = React.useState(false)

  return (
    <Box>
      <Button onClick={() => setErr(true)} variant="outlined" color="error" size="small" data-cy="errorButton">
        Throw error
      </Button>
      {err && <ErrorCausingComponent />}
    </Box>
  )
}

export default CrashDebug
