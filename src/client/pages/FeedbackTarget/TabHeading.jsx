import { Box, Typography } from '@mui/material'

const TabHeading = ({ children, actions }) => {
  const heading = (
    <Typography component="h3" variant="h6" sx={{ mb: actions ? 0 : 3 }}>
      {children}
    </Typography>
  )

  if (!actions) return heading

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 2,
        rowGap: 1,
        mb: 3,
      }}
    >
      {heading}
      {actions}
    </Box>
  )
}

export default TabHeading
