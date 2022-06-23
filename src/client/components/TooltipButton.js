import React from 'react'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'

export const TooltipButton = ({ tooltip, disabled, children }, props) => {
  const button = <Button {...props}>{children}</Button>

  if (disabled) {
    return (
      <Tooltip title={tooltip}>
        <span>{button}</span>
      </Tooltip>
    )
  }

  return button
}
