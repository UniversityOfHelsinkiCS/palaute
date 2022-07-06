import React from 'react'

import { Box, CircularProgress, Alert } from '@mui/material'

export const LoadingProgress = ({ isError = false, message = '' }) => (
  <Box display="flex" justifyContent="center" my={4}>
    <Box display="flex" flexDirection="column" alignItems="center">
      <CircularProgress />
      <Box height={10} py={4}>
        {isError && <Alert severity="warning">{message}</Alert>}
      </Box>
    </Box>
  </Box>
)
