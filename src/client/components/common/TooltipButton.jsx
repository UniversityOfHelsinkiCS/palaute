import React from 'react'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'

export const TooltipButton = ({ tooltip, disabled, always, children, ...props }) => {
  const button = (
    <Button disabled={disabled} {...props}>
      {children}
    </Button>
  )
  if (always || disabled) {
    return (
      <Tooltip title={tooltip}>
        <span>{button}</span>
      </Tooltip>
    )
  }

  return button
}
