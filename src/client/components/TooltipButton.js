import React from 'react'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'

export const TooltipButton = (props) => {
  const button = <Button {...props}>{props.children}</Button>

  if (props.disabled) {
    return (
      <Tooltip title={props.tooltip}>
        <span>{button}</span>
      </Tooltip>
    )
  }

  return button
}
