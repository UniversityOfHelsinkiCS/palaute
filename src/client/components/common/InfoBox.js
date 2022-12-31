import { Alert, Tooltip, Typography } from '@mui/material'
import React from 'react'

const InfoBox = ({ label, content, severity = 'info', sx = {} }) => (
  <Tooltip arrow title={<Typography sx={{ p: 1, ...sx }}>{content}</Typography>}>
    <Alert severity={severity} sx={{ cursor: 'pointer', py: 0.3 }}>
      {label}
    </Alert>
  </Tooltip>
)

export default InfoBox
