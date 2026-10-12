import { ButtonProps, SxProps, Theme } from '@mui/material'
import Button from '@mui/material/Button'
import { forwardRef, ReactNode } from 'react'

import { focusIndicatorStyle } from '../../util/accessibility'
import { mergeSx } from '../../util/sx'

type NorButtonVariant = 'primary' | 'secondary' | 'error' | 'cancel' | 'warning' | 'empty'

type NorButtonProps = Omit<ButtonProps, 'color' | 'variant'> & {
  color?: NorButtonVariant
  icon?: ReactNode
  to?: string
}

type ColorMap = {
  [Variant in NorButtonVariant]: {
    variant: 'contained' | 'outlined' | 'text'
    color?: ButtonProps['color']
    sx?: SxProps<Theme>
  }
}

export const NorButton = forwardRef<HTMLButtonElement, NorButtonProps>(
  ({ color = 'primary', disabled, icon, children, sx, ...props }, ref) => {
    const colorMap: ColorMap = {
      primary: { variant: 'contained', color: 'primary' },
      secondary: { variant: 'outlined', color: 'primary' },
      error: { variant: 'contained', color: 'error' },
      cancel: { variant: 'outlined', color: 'error' },
      // warning.main is too light for text, so the text uses warning.dark
      warning: {
        variant: 'outlined',
        color: 'warning',
        sx: {
          color: 'warning.dark',
          backgroundColor: 'warning.extraLight',
          borderColor: 'warning.main',
          '&:hover': { backgroundColor: 'warning.light', borderColor: 'warning.main' },
        },
      },
      empty: { variant: 'text' },
    }

    const { sx: variantSx, ...mappedProps } = colorMap[color] || colorMap.primary

    return (
      <Button
        ref={ref}
        {...mappedProps}
        disabled={disabled}
        startIcon={icon}
        disableFocusRipple
        sx={mergeSx(variantSx, sx, focusIndicatorStyle())}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
