export const focusIndicatorStyle = ({ color } = {}) => {
  const focusIndicatorStyle = {
    '&.Mui-focusVisible': {
      outline: '3px solid',
      outlineColor: theme => color ?? theme.palette.primary.main,
      outlineOffset: '3px',
    },
  }

  return focusIndicatorStyle
}

export const radioFocusIndicatorStyle = ({ color } = {}) => ({
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

export const switchFocusIndicatorStyle = {
  '& .MuiSwitch-switchBase.Mui-focusVisible .MuiSwitch-thumb': {
    outline: '3px solid',
    outlineColor: theme => theme.palette.primary.main,
    outlineOffset: '3px',
  },
}
