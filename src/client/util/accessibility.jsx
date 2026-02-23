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
