import React, { forwardRef, ReactNode } from 'react'
import Button from '@mui/material/Button'
import { ButtonProps } from '@mui/material'

type NorButtonVariant = 'primary' | 'secondary' | 'error' | 'cancel' | 'empty'

interface NorButtonProps extends Omit<ButtonProps, 'color' | 'variant'> {
  color?: NorButtonVariant
  icon?: ReactNode
}

type ColorMap = {
  [Variant in NorButtonVariant]: {
    variant: 'contained' | 'outlined' | 'text'
    color?: ButtonProps['color']
  }
}

export const NorButton = forwardRef<HTMLButtonElement, NorButtonProps>(
  ({ color = 'primary', disabled, icon, children, ...props }, ref) => {
    const colorMap: ColorMap = {
      primary: { variant: 'contained', color: 'primary' },
      secondary: { variant: 'outlined', color: 'primary' },
      error: { variant: 'contained', color: 'error' },
      cancel: { variant: 'outlined', color: 'error' },
      empty: { variant: 'text' },
    }

    const mappedProps = colorMap[color] || colorMap.primary

    return (
      <Button ref={ref} {...mappedProps} disabled={disabled} startIcon={icon} {...props}>
        {children}
      </Button>
    )
  }
)
