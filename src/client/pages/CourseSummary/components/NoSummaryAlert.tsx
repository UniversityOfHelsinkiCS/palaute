import { Box, Alert } from '@mui/material'

const NoSummaryAlert = ({ alertText }) => {
  return (
    <Box my="1rem" mx="2rem">
      <Alert severity="info">{alertText}</Alert>
    </Box>
  )
}

export default NoSummaryAlert
