import { Box, Typography } from '@mui/material'

const LanguageFieldset = ({ language, children }) => (
  <Box component="fieldset" sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
    <Typography variant="h6" component="legend" sx={{ p: 0, mb: 2 }}>
      {language.toUpperCase()}
    </Typography>
    {children}
  </Box>
)

export default LanguageFieldset
