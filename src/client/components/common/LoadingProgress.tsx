import { Box, CircularProgress, Alert } from '@mui/material'

type LoadingProgressProps = {
  isError?: boolean
  message?: string
}

export const LoadingProgress = ({ isError = false, message = '' }: LoadingProgressProps) => (
  <Box display="flex" justifyContent="center" my={4}>
    <Box display="flex" flexDirection="column" alignItems="center">
      <CircularProgress />
      <Box height={10} py={4}>
        {isError && <Alert severity="warning">{message}</Alert>}
      </Box>
    </Box>
  </Box>
)
