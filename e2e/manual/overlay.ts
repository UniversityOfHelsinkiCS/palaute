import type { Page } from '@playwright/test'

export const CURSOR_ID = 'manual-cursor'
export const CAPTION_ID = 'manual-caption'
export const CAPTION_STORAGE_KEY = 'manualCaption'
export const CURTAIN_ID = 'manual-curtain'
export const CURTAIN_STORAGE_KEY = 'manualCurtain'
export const CURTAIN_FADE_MS = 400

type OverlayIds = {
  cursorId: string
  captionId: string
  captionStorageKey: string
  curtainId: string
  curtainStorageKey: string
  curtainFadeMs: number
}

const overlayIds: OverlayIds = {
  cursorId: CURSOR_ID,
  captionId: CAPTION_ID,
  captionStorageKey: CAPTION_STORAGE_KEY,
  curtainId: CURTAIN_ID,
  curtainStorageKey: CURTAIN_STORAGE_KEY,
  curtainFadeMs: CURTAIN_FADE_MS,
}

// Runs in the browser on every page load, so it must not reference anything outside itself
const drawOverlay = ({
  cursorId,
  captionId,
  captionStorageKey,
  curtainId,
  curtainStorageKey,
  curtainFadeMs,
}: OverlayIds) => {
  // Attached before the page renders, so a reload behind the curtain never shows and the caption stays on it.
  // The script can run before the document has a root element.
  const whenRoot = (attach: () => void) => {
    if (document.documentElement) return attach()
    const observer = new MutationObserver(() => {
      if (!document.documentElement) return
      observer.disconnect()
      attach()
    })
    observer.observe(document, { childList: true })
  }

  const curtain = document.createElement('div')
  curtain.id = curtainId
  // Holds the text while the curtain is down
  const curtainText = sessionStorage.getItem(curtainStorageKey)
  Object.assign(curtain.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: 'radial-gradient(circle at center, #3770b3 0%, #124c8c 100%)',
    opacity: curtainText ? '1' : '0',
    transition: `opacity ${curtainFadeMs}ms ease`,
    pointerEvents: 'none',
    zIndex: '2147483647',
  })
  const seal = document.createElement('img')
  seal.src = '/seal.gif'
  seal.alt = ''
  Object.assign(seal.style, {
    width: '160px',
    height: '160px',
    filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3))',
  })
  const transitionText = document.createElement('div')
  transitionText.id = `${curtainId}-text`
  transitionText.textContent = curtainText
  Object.assign(transitionText.style, {
    color: '#ffffff',
    font: 'italic 600 32px/1.35 system-ui, sans-serif',
    textShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
  })
  curtain.append(seal, transitionText)
  whenRoot(() => document.documentElement.append(curtain))

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
      left: '50%',
      bottom: '32px',
      transform: 'translateX(-50%)',
      width: 'max-content',
      maxWidth: 'calc(100% - 64px)',
      boxSizing: 'border-box',
      padding: '14px 28px',
      borderRadius: '12px',
      background: 'rgba(0, 0, 0, 0.55)',
      textShadow: '0 1px 3px #000',
      color: '#ffffff',
      font: '600 32px/1.35 system-ui, sans-serif',
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

    document.documentElement.append(cursor, curtain, caption)

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

  whenRoot(attach)
}

export const installOverlay = (page: Page) => page.addInitScript(drawOverlay, overlayIds)

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

// Null lifts the curtain
export const showCurtain = (page: Page, text: string | null) =>
  page.evaluate(
    ({ curtainId, curtainStorageKey, text }) => {
      if (text === null) sessionStorage.removeItem(curtainStorageKey)
      else sessionStorage.setItem(curtainStorageKey, text)
      const curtain = document.getElementById(curtainId)
      if (!curtain) return
      curtain.style.opacity = text === null ? '0' : '1'
      // Kept while fading out
      if (text !== null) document.getElementById(`${curtainId}-text`)!.textContent = text
    },
    { curtainId: CURTAIN_ID, curtainStorageKey: CURTAIN_STORAGE_KEY, text }
  )
