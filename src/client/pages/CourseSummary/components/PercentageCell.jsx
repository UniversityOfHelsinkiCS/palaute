import { Box, Chip, Tooltip } from '@mui/material'
import React from 'react'

const styles = {
  cell: {
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
  },
}

/**
 * Give percent as 0-100
 * @param {{ string, number }} { label, percent }
 * @returns
 */
const PercentageCell = ({ label, tooltip, percent, sx, ...rest }) => {
  let hex = Number(percent * 2.55).toString(16)
  const indexOfDot = hex.indexOf('.')
  hex = indexOfDot === -1 ? hex : hex.substring(0, indexOfDot)
  hex = hex.padStart(2, '0')

  return (
    <Tooltip title={tooltip} disableInteractive>
      <Box sx={{ ...styles.cell, ...(sx ?? {}) }}>
        <Chip
          {...rest}
          label={label}
          variant={percent ? 'filled' : 'outlined'}
          sx={{
            background: theme => `${theme.palette.info.light}${hex}`,
          }}
        />
      </Box>
    </Tooltip>
  )
}

export default PercentageCell
