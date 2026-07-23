import { Box, Typography } from '@mui/material'
import { format } from 'date-fns'
import React from 'react'

import { OpenFeedbackContainer } from '../OpenFeedback/OpenFeedback'

export const LogItem = ({ log, parseLogMessage }) => (
  <OpenFeedbackContainer>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'end' }}>
      <Typography variant="body2" color="text.secondary">
        {format(new Date(log.createdAt), 'hh:mm dd.MM.yyyy')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {log.user.email}
      </Typography>
      <Typography>{parseLogMessage(log.data)}</Typography>
    </Box>
  </OpenFeedbackContainer>
)
