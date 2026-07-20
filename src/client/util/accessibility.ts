import type { Theme } from '@mui/material'
import type { SystemStyleObject } from '@mui/system'

export const focusIndicatorStyle = ({ color }: { color?: string } = {}): SystemStyleObject<Theme> => {
  const focusIndicatorStyle: SystemStyleObject<Theme> = {
    '&.Mui-focusVisible': {
      outline: '3px solid',
      outlineColor: theme => color ?? theme.palette.primary.main,
      outlineOffset: '3px',
    },
  }

  return focusIndicatorStyle
}

export const optionFocusIndicatorStyle = ({ color }: { color?: string } = {}): SystemStyleObject<Theme> => ({
  display: 'inline-flex',
  maxWidth: 'fit-content',
  alignItems: 'center',
  borderRadius: 1,
  '&:has(:focus-visible)': {
    outline: '3px solid',
    outlineColor: theme => color ?? theme.palette.primary.main,
    outlineOffset: '3px',
  },
})

export const switchFocusIndicatorStyle: SystemStyleObject<Theme> = {
  '& .MuiSwitch-switchBase.Mui-focusVisible .MuiSwitch-thumb': {
    outline: '3px solid',
    outlineColor: theme => theme.palette.primary.main,
    outlineOffset: '3px',
  },
}
