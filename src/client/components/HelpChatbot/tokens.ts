import type { Theme } from '@mui/material'

import { lighten } from '@mui/material/styles'

// lighten() rather than alpha(): the widget must stay opaque over the page
export const primaryTint = (theme: Theme) => lighten(theme.palette.primary.main, 0.94)
export const primaryTintBorder = (theme: Theme) => lighten(theme.palette.primary.main, 0.7)

// Same look as focusIndicatorStyle(), for elements that aren't MUI buttons
export const focusRing = {
  outline: '3px solid',
  outlineColor: 'primary.main',
  outlineOffset: '2px',
}
