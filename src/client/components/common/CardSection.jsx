import React from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'

const CardSection = ({ title, children }) => (
  <Card>
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
