import { Alert, Box, Tooltip, Typography } from '@mui/material'
import React from 'react'

const InfoBox = ({ label, content, severity = 'info', sx = {} }) => (
  <Box sx={{ '@media print': { display: 'none' } }}>
    <Tooltip arrow title={<Typography sx={{ p: 1, ...sx }}>{content}</Typography>}>
      <Alert severity={severity} sx={{ cursor: 'pointer', py: 0.3 }}>
        {label}
      </Alert>
    </Tooltip>
  </Box>
)

export default InfoBox
