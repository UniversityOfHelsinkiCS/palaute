import { Box, Chip, Tooltip } from '@mui/material'
import React from 'react'
import { Link } from 'react-router'

import { focusIndicatorStyle } from '../../../util/accessibility'

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
const PercentageCell = ({ label, tooltip, ariaLabel, percent, sx, linkTo, ...rest }) => {
  let hex = (percent * 2.55).toString(16)
  const indexOfDot = hex.indexOf('.')
  hex = indexOfDot === -1 ? hex : hex.substring(0, indexOfDot)
  hex = hex.padStart(2, '0')

  return (
    <Tooltip title={tooltip} disableInteractive>
      <Box sx={{ ...styles.cell, ...(sx ?? {}) }} aria-label={undefined}>
        <Chip
          {...rest}
          clickable={linkTo}
          component={linkTo ? Link : undefined}
          to={linkTo || undefined}
          label={label}
          variant={percent ? 'filled' : 'outlined'}
          sx={{
            background: theme => `${theme.palette.info.light}${hex}`,
            ...focusIndicatorStyle(),
          }}
          aria-label={ariaLabel}
        />
      </Box>
    </Tooltip>
  )
}

export default PercentageCell
