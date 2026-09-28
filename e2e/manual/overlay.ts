import type { Page } from '@playwright/test'

export const CURSOR_ID = 'manual-cursor'
export const CAPTION_ID = 'manual-caption'
export const CAPTION_STORAGE_KEY = 'manualCaption'

type OverlayIds = { cursorId: string; captionId: string; captionStorageKey: string }

// Runs in the browser on every page load, so it must not reference anything outside itself
const drawOverlay = ({ cursorId, captionId, captionStorageKey }: OverlayIds) => {
  const attach = () => {
    const cursor = document.createElement('div')
    cursor.id = cursorId
    Object.assign(cursor.style, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '22px',
      height: '22px',
      marginLeft: '-11px',
      marginTop: '-11px',
      borderRadius: '50%',
      background: 'rgba(220, 38, 38, 0.85)',
      border: '2px solid rgba(255, 255, 255, 0.95)',
      boxShadow: '0 0 8px rgba(0, 0, 0, 0.45)',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '2147483647',
      transition: 'transform 80ms ease',
    })

    const caption = document.createElement('div')
    caption.id = captionId
    Object.assign(caption.style, {
      position: 'fixed',
      left: '0',
      right: '0',
      bottom: '0',
      padding: '16px 28px',
      background: 'rgba(17, 17, 22, 0.88)',
      color: '#ffffff',
      font: '21px/1.4 system-ui, sans-serif',
      textAlign: 'center',
      opacity: '0',
      transition: 'opacity 220ms ease',
      pointerEvents: 'none',
      zIndex: '2147483647',
    })
    const text = sessionStorage.getItem(captionStorageKey)
    if (text) {
      caption.textContent = text
      caption.style.opacity = '1'
    }

    document.documentElement.append(cursor, caption)

    document.addEventListener(
      'mousemove',
      event => {
        cursor.style.left = `${event.clientX}px`
        cursor.style.top = `${event.clientY}px`
        cursor.style.opacity = '1'
      },
      true
    )
    document.addEventListener('mousedown', () => (cursor.style.transform = 'scale(0.7)'), true)
    document.addEventListener('mouseup', () => (cursor.style.transform = 'scale(1)'), true)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach)
  else attach()
}

export const installOverlay = (page: Page) =>
  page.addInitScript(drawOverlay, {
    cursorId: CURSOR_ID,
    captionId: CAPTION_ID,
    captionStorageKey: CAPTION_STORAGE_KEY,
  })

export const showCaption = (page: Page, text: string) =>
  page.evaluate(
    ({ captionId, captionStorageKey, text }) => {
      sessionStorage.setItem(captionStorageKey, text)
      const caption = document.getElementById(captionId)
      if (!caption) return
      caption.textContent = text
      caption.style.opacity = text ? '1' : '0'
    },
    { captionId: CAPTION_ID, captionStorageKey: CAPTION_STORAGE_KEY, text }
  )
