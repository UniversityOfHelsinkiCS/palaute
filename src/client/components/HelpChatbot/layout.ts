import type { SxProps, Theme } from '@mui/material'

export type WidgetView = 'closed' | 'menu' | 'chat'

export type ChatSize = 'normal' | 'expanded'

export type SealPlacement = { right: string; bottom: string; scale: number }

export type BoxLayout = {
  width: string
  height: string
  radius: string
  border: number
  fullScreen: boolean
  seal: SealPlacement
}

export const SEAL_SIZE = 40
const BOX_BORDER = 1
// Twice the box's distance from the viewport corner
const VIEWPORT_MARGIN = 48

export const CHAT_HEADER_HEIGHT = 60

export const PILL_HEIGHT = 56
export const PILL_PADDING_LEFT = 54
export const PILL_PADDING_RIGHT = 18
// Used only until the pill's label and the menu's content have been measured, before the first paint
export const DEFAULT_PILL_WIDTH = 172
export const DEFAULT_MENU_HEIGHT = 192
const MENU_WIDTH = 300
// The seal sits in the bottom option's icon slot
const MENU_SEAL_LEFT = 26
const MENU_SEAL_BOTTOM = 23

// The chat doesn't fit next to the page below these (WCAG 1.4.10 Reflow). Theme breakpoints are width-only.
export const FULL_SCREEN_QUERY = '(max-height: 639.95px)'
// So short that the header and the input would leave no room for messages
export const COMPACT_QUERY = '(max-height: 399.95px)'

export const TRANSITION = '.32s cubic-bezier(.2, .8, .2, 1)'

const px = (value: number) => `${value}px`

export const getPillWidth = (labelWidth: number) =>
  Math.ceil(labelWidth) + PILL_PADDING_LEFT + PILL_PADDING_RIGHT + 2 * BOX_BORDER

export const getMenuHeight = (contentHeight: number) => Math.ceil(contentHeight) + 2 * BOX_BORDER

// Offsets from the fixed bottom-right corner, which stays put while the box resizes. Positioning the seal
// relative to the box made it jump ahead of the resize. `left`/`top` place its corner inside the box.
const sealAt = (width: string, height: string, left: number, top: number, scale: number): SealPlacement => ({
  right: `calc(${width} - ${left + SEAL_SIZE * scale}px)`,
  bottom: `calc(${height} - ${top + SEAL_SIZE * scale}px)`,
  scale,
})

const fixedBox = (width: string, height: string, radius: number, seal: [number, number, number]): BoxLayout => ({
  width,
  height,
  radius: px(radius),
  border: BOX_BORDER,
  fullScreen: false,
  seal: sealAt(width, height, ...seal),
})

type LayoutInput = {
  view: WidgetView
  pillWidth: number
  menuHeight: number
  chatSize: ChatSize
  fullScreen: boolean
}

// Sizes are CSS lengths, so plain CSS transitions can animate between views. Only the pill's and the menu's
// content is measured, because their text length varies.
export const getLayout = ({ view, pillWidth, menuHeight, chatSize, fullScreen }: LayoutInput): BoxLayout => {
  if (view === 'closed') return fixedBox(px(pillWidth), px(PILL_HEIGHT), PILL_HEIGHT / 2, [9, 8, 1])
  if (view === 'menu') {
    const sealTop = menuHeight - MENU_SEAL_BOTTOM - SEAL_SIZE
    return fixedBox(px(MENU_WIDTH), px(menuHeight), 16, [MENU_SEAL_LEFT, sealTop, 1])
  }
  if (fullScreen) {
    // 100vw includes the page's scrollbar, so the page doesn't scroll while the chat is full-screen
    return {
      width: '100vw',
      height: '100dvh',
      radius: '0px',
      border: 0,
      fullScreen,
      seal: sealAt('100vw', '100dvh', 14, 14, 0.8),
    }
  }
  if (chatSize === 'expanded') {
    const width = `min(600px, 100vw - ${VIEWPORT_MARGIN}px)`
    const height = `min(680px, 100dvh - ${VIEWPORT_MARGIN}px)`
    return fixedBox(width, height, 12, [15, 15, 0.8])
  }
  return fixedBox(px(380), px(560), 12, [15, 15, 0.8])
}

// Above the sticky NavBar and FixedContainer toolbars, below modals, skip links, snackbars and tooltips
export const widgetZIndex = (theme: Theme) => theme.zIndex.appBar + 1

export const anchorSx =
  (fullScreen: boolean): SxProps<Theme> =>
  theme => ({
    position: 'fixed',
    right: fullScreen ? 0 : theme.spacing(2),
    bottom: fullScreen ? 0 : theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      right: fullScreen ? 0 : theme.spacing(3),
      bottom: fullScreen ? 0 : theme.spacing(3),
    },
  })
