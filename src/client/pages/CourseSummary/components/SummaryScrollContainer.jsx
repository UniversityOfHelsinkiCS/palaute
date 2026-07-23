import { Box } from '@mui/material'

const SummaryScrollContainer = ({ children }) => (
  <Box
    sx={{
      overflowY: 'auto',
      overflowX: 'auto',
    }}
  >
    {children}
  </Box>
)

export default SummaryScrollContainer
