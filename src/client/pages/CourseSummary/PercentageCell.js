import { Box, Chip } from '@mui/material'
import React from 'react'

const styles = {
  cell: {
    display: 'flex',
    justifyContent: 'center',
  },
}

/**
 * Give percent as 0-100
 * @param {{ string, number }} { label, percent }
 * @returns
 */
const PercentageCell = ({ label, percent, sx }) => {
  let hex = Number(percent * 2.55).toString(16)
  const indexOfDot = hex.indexOf('.')
  hex = indexOfDot === -1 ? hex : hex.substring(0, indexOfDot)
  hex = hex.padStart(2, '0')

  return (
    <Box sx={styles.cell}>
      <Chip
        label={label}
        sx={{
          background: theme => `${theme.palette.info.light}${hex}`,
          ...(sx ?? {}),
        }}
      />
    </Box>
  )
}
export default PercentageCell
