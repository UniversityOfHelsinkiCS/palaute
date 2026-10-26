import type { Theme } from '@mui/material'
import type { SystemStyleObject } from '@mui/system'

const OUTLINE_WIDTH = 3
const OUTLINE_OFFSET = 3

// How far a focus indicator reaches outside its element
export const FOCUS_INDICATOR_REACH = OUTLINE_WIDTH + OUTLINE_OFFSET

export const focusIndicatorStyle = ({
  color,
  backgroundColor,
}: { color?: string; backgroundColor?: string } = {}): SystemStyleObject<Theme> => {
  const focusIndicatorStyle: SystemStyleObject<Theme> = {
    '&.Mui-focusVisible': {
      outline: `${OUTLINE_WIDTH}px solid`,
      outlineColor: theme => color ?? theme.palette.primary.main,
      outlineOffset: `${OUTLINE_OFFSET}px`,
      backgroundColor: backgroundColor,
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
    outline: `${OUTLINE_WIDTH}px solid`,
    outlineColor: theme => color ?? theme.palette.primary.main,
    outlineOffset: `${OUTLINE_OFFSET}px`,
  },
})

export const switchFocusIndicatorStyle: SystemStyleObject<Theme> = {
  '& .MuiSwitch-switchBase.Mui-focusVisible .MuiSwitch-thumb': {
    outline: `${OUTLINE_WIDTH}px solid`,
    outlineColor: theme => theme.palette.primary.main,
    outlineOffset: `${OUTLINE_OFFSET}px`,
  },
}
