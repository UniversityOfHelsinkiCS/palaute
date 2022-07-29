import { Chip } from '@mui/material'
import React from 'react'

const PercentageCell = ({ percent }) => {
  let hex = Number(percent * 2.55).toString(16)
  const indexOfDot = hex.indexOf('.')
  hex = indexOfDot === -1 ? hex : hex.substring(0, indexOfDot)
  hex = hex.padStart(2, '0')

  return (
    <Chip
      label={`${percent}%`}
      sx={{
        background: (theme) => `${theme.palette.info.light}${hex}`,
      }}
    />
  )
}
export default PercentageCell
