import type { KeyboardEvent } from 'react'

import { Box, useMediaQuery } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { visuallyHidden } from '@mui/utils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { ChatSize, WidgetView } from './layout'

import { mergeSx } from '../../util/sx'
import ChatPanel from './ChatPanel'
import {
  DEFAULT_MENU_HEIGHT,
  DEFAULT_PILL_WIDTH,
  FULL_SCREEN_QUERY,
  TRANSITION,
  anchorSx,
  getLayout,
  stickyRootSx,
  widgetZIndex,
} from './layout'
import MenuView from './MenuView'
import PillView from './PillView'
import { focusRing, primaryTint, primaryTintBorder } from './tokens'
import useAnnouncer from './useAnnouncer'
import useConversation from './useConversation'
import useGuideUrl from './useGuideUrl'
import WidgetSeal from './WidgetSeal'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const boxTransition = [
  ...['width', 'height', 'border-radius', 'right', 'bottom'].map(property => `${property} ${TRANSITION}`),
  ...['background-color', 'border-color', 'box-shadow'].map(property => `${property} .18s`),
].join(', ')

// Stays mounted across in-app navigation, which is what persists the conversation
const HelpChatbot = () => {
  const { t } = useTranslation()
  const guideUrl = useGuideUrl()

  const [view, setView] = useState<WidgetView>('closed')
  const [pillWidth, setPillWidth] = useState(DEFAULT_PILL_WIDTH)
  const [menuHeight, setMenuHeight] = useState(DEFAULT_MENU_HEIGHT)
  const [draft, setDraft] = useState('')
  const [chatSize, setChatSize] = useState<ChatSize>('normal')
  const [sealOnce, setSealOnce] = useState(false)
  const { entries, pending, retryableId, send, retry, startNew } = useConversation()
  const { message: announcement, announce } = useAnnouncer()

  const pillRef = useRef<HTMLButtonElement>(null)
  const askRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const focusAfterViewChange = useRef(false)

  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const narrow = useMediaQuery(theme => theme.breakpoints.down('sm'))
  const short = useMediaQuery(FULL_SCREEN_QUERY)
  const fullScreen = view === 'chat' && (narrow || short)

  // The element the user activated disappears on every view change, so focus is moved explicitly
  const goTo = (next: WidgetView) => {
    focusAfterViewChange.current = true
    setView(next)
  }

  useEffect(() => {
    if (!focusAfterViewChange.current) return
    focusAfterViewChange.current = false
    const target = { closed: pillRef, menu: askRef, chat: inputRef }[view]
    target.current?.focus()
  }, [view])

  // The expand toggle disappears when the chat goes full-screen
  useEffect(() => {
    if (fullScreen && document.activeElement === document.body) inputRef.current?.focus()
  }, [fullScreen])

  // 100vw includes the scrollbar, so the page mustn't scroll behind the full-screen chat
  useEffect(() => {
    if (!fullScreen) return undefined
    const { style } = document.documentElement
    const previousOverflow = style.overflow
    style.overflow = 'hidden'
    return () => {
      style.overflow = previousOverflow
    }
  }, [fullScreen])

  const openFromPill = () => {
    if (!reduceMotion) setSealOnce(true)
    goTo(guideUrl ? 'menu' : 'chat')
  }

  const close = () => goTo('closed')

  const sendDraft = () => {
    const question = draft.trim()
    if (!question) return
    send(question)
    setDraft('')
  }

  // The Retry button disappears, so focus goes where the user will type next
  const retryQuestion = () => {
    retry()
    inputRef.current?.focus()
  }

  const announceFailure = useCallback(() => announce(t('helpChatbot:failedAnnouncement')), [announce, t])

  const startNewConversation = () => {
    startNew()
    inputRef.current?.focus()
    announce(t('helpChatbot:newConversationStarted'))
  }

  // Handled here and stopped, so EscSnackbarCloser doesn't also close every snackbar
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || view === 'closed') return
    event.stopPropagation()
    close()
  }

  const layout = getLayout({ view, pillWidth, menuHeight, chatSize, fullScreen })
  const contentSize = {
    width: `calc(${layout.width} - ${2 * layout.border}px)`,
    height: `calc(${layout.height} - ${2 * layout.border}px)`,
  }

  return (
    <Box
      component="aside"
      aria-label={t('helpChatbot:regionLabel')}
      onKeyDown={handleKeyDown}
      sx={stickyRootSx(view, layout)}
    >
      <Box
        sx={mergeSx(anchorSx(fullScreen), {
          zIndex: widgetZIndex,
          boxSizing: 'border-box',
          width: layout.width,
          height: layout.height,
          borderRadius: layout.radius,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: `${layout.border}px solid`,
          borderColor: 'divider',
          boxShadow: fullScreen ? 'none' : view === 'closed' ? 2 : 8,
          color: 'text.primary',
          fontSize: '14.5px',
          lineHeight: 1.5,
          transition: boxTransition,
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          ...(view === 'closed' && {
            '&:hover': { bgcolor: primaryTint, borderColor: primaryTintBorder },
            '&:has(:focus-visible)': focusRing,
          }),
        })}
      >
        {/* Each view is laid out at its final size, so a resizing box clips it instead of reflowing it.
            It fades in once the box has mostly finished resizing. */}
        <Box
          key={view}
          sx={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            ...contentSize,
            animation: `${fadeIn} .2s ease .24s both`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          {view === 'closed' && <PillView buttonRef={pillRef} onOpen={openFromPill} onWidthChange={setPillWidth} />}
          {view === 'menu' && guideUrl && (
            <MenuView
              guideUrl={guideUrl}
              askRef={askRef}
              onHeightChange={setMenuHeight}
              onAsk={() => goTo('chat')}
              onClose={close}
            />
          )}
          {view === 'chat' && (
            <ChatPanel
              guideUrl={guideUrl}
              inputRef={inputRef}
              entries={entries}
              pending={pending}
              retryableId={retryableId}
              expanded={chatSize === 'expanded'}
              fullScreen={fullScreen}
              draft={draft}
              onDraftChange={setDraft}
              onSend={sendDraft}
              onReply={announce}
              onFailure={announceFailure}
              onRetry={retryQuestion}
              onToggleExpand={() => setChatSize(chatSize === 'expanded' ? 'normal' : 'expanded')}
              onNewConversation={startNewConversation}
              onClose={close}
            />
          )}
        </Box>
      </Box>
      <WidgetSeal
        placement={layout.seal}
        fullScreen={fullScreen}
        once={sealOnce}
        loop={pending && view === 'chat' && !reduceMotion}
        onOnceEnd={() => setSealOnce(false)}
      />
      <Box role="status" sx={visuallyHidden}>
        {announcement}
      </Box>
    </Box>
  )
}

export default HelpChatbot
