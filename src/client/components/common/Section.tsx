import type { ReactNode } from 'react'

import { Box, Typography } from '@mui/material'

type SectionProps = {
  title: string
  children: ReactNode
}

// Section of feedback target tab's content
const Section = ({ title, children }: SectionProps) => (
  <Box>
    <Typography component="h4" variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
      {title}
    </Typography>
    {children}
  </Box>
)

export default Section
