import React from 'react'
import type { ReactNode } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

interface CardSectionProps {
  title: string
  children: ReactNode
  sx?: SxProps<Theme>
}

const CardSection = ({ title, children, sx }: CardSectionProps) => (
  <Card sx={sx}>
    <CardContent>
      <Box mb={4}>
        <Typography component="h2" variant="h6">
          {title}
        </Typography>
      </Box>
      {children}
    </CardContent>
  </Card>
)

export default CardSection
