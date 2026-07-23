import type { ButtonProps } from '@mui/material/Button'
import type { ReactNode } from 'react'

import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import React from 'react'

import { focusIndicatorStyle } from '../../util/accessibility'

type TooltipButtonProps = ButtonProps & {
  tooltip: string
  always?: boolean
  children: ReactNode
}

export const TooltipButton = ({ tooltip, disabled, always, children, ...props }: TooltipButtonProps) => {
  const button = (
    <Button disabled={disabled} sx={focusIndicatorStyle()} disableRipple {...props}>
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
