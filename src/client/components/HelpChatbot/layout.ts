import type { SxProps, Theme } from '@mui/material'

export type WidgetView = 'closed' | 'menu' | 'chat'

export type SealPlacement = { right: string; bottom: string; scale: number }

export type BoxLayout = {
  width: string
  height: string
  radius: string
  seal: SealPlacement
}

export const SEAL_SIZE = 40
export const BOX_BORDER = 1

export const PILL_HEIGHT = 56
export const PILL_PADDING_LEFT = 54
export const PILL_PADDING_RIGHT = 18
// Used only until the label has been measured, which happens before the first paint
export const DEFAULT_PILL_WIDTH = 172

const px = (value: number) => `${value}px`

export const getPillWidth = (labelWidth: number) =>
  Math.ceil(labelWidth) + PILL_PADDING_LEFT + PILL_PADDING_RIGHT + 2 * BOX_BORDER

// Offsets from the fixed bottom-right corner, which stays put while the box resizes. Positioning the seal
// relative to the box made it jump ahead of the resize. `left`/`top` place its corner inside the box.
const sealAt = (width: number, height: number, left: number, top: number, scale: number): SealPlacement => ({
  right: px(width - left - SEAL_SIZE * scale),
  bottom: px(height - top - SEAL_SIZE * scale),
  scale,
})

// Fixed sizes, so plain CSS transitions can animate between views
export const getLayout = (view: WidgetView, pillWidth: number): BoxLayout => {
  const layouts: Record<WidgetView, BoxLayout> = {
    closed: {
      width: px(pillWidth),
      height: px(PILL_HEIGHT),
      radius: px(PILL_HEIGHT / 2),
      seal: sealAt(pillWidth, PILL_HEIGHT, 9, 8, 1),
    },
    menu: { width: px(300), height: px(192), radius: px(16), seal: sealAt(300, 192, 26, 129, 1) },
    chat: { width: px(380), height: px(560), radius: px(12), seal: sealAt(380, 560, 15, 15, 0.8) },
  }
  return layouts[view]
}

// Above the sticky NavBar and FixedContainer toolbars, below modals, skip links, snackbars and tooltips
export const widgetZIndex = (theme: Theme) => theme.zIndex.appBar + 1

export const anchorSx: SxProps<Theme> = theme => ({
  position: 'fixed',
  right: theme.spacing(2),
  bottom: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    right: theme.spacing(3),
    bottom: theme.spacing(3),
  },
})
