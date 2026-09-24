import type { KeyboardEvent } from 'react'

import { Box } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { WidgetView } from './layout'

import { mergeSx } from '../../util/sx'
import ChatPanel from './ChatPanel'
import { BOX_BORDER, DEFAULT_PILL_WIDTH, anchorSx, getLayout, widgetZIndex } from './layout'
import MenuView from './MenuView'
import PillView from './PillView'
import { focusRing, primaryTint, primaryTintBorder } from './tokens'
import useAnnouncer from './useAnnouncer'
import useConversation from './useConversation'
import useGuideUrl from './useGuideUrl'
import WidgetSeal from './WidgetSeal'

// Stays mounted across in-app navigation, which is what persists the conversation
const HelpChatbot = () => {
  const { t } = useTranslation()
  const guideUrl = useGuideUrl()

  const [view, setView] = useState<WidgetView>('closed')
  const [pillWidth, setPillWidth] = useState(DEFAULT_PILL_WIDTH)
  const [draft, setDraft] = useState('')
  const { entries, pending, retryableId, send, retry, startNew } = useConversation()
  const { message: announcement, announce } = useAnnouncer()

  const pillRef = useRef<HTMLButtonElement>(null)
  const askRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const focusAfterViewChange = useRef(false)

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

  const layout = getLayout(view, pillWidth)
  const contentSize = {
    width: `calc(${layout.width} - ${2 * BOX_BORDER}px)`,
    height: `calc(${layout.height} - ${2 * BOX_BORDER}px)`,
  }

  return (
    <Box component="aside" aria-label={t('helpChatbot:regionLabel')} onKeyDown={handleKeyDown}>
      <Box
        sx={mergeSx(anchorSx, {
          zIndex: widgetZIndex,
          boxSizing: 'border-box',
          width: layout.width,
          height: layout.height,
          borderRadius: layout.radius,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: `${BOX_BORDER}px solid`,
          borderColor: 'divider',
          boxShadow: view === 'closed' ? 2 : 8,
          color: 'text.primary',
          fontSize: '14.5px',
          lineHeight: 1.5,
          ...(view === 'closed' && {
            '&:hover': { bgcolor: primaryTint, borderColor: primaryTintBorder },
            '&:has(:focus-visible)': focusRing,
          }),
        })}
      >
        {/* Each view is laid out at its final size, so a resizing box clips it instead of reflowing it */}
        <Box sx={{ position: 'absolute', right: 0, bottom: 0, ...contentSize }}>
          {view === 'closed' && (
            <PillView
              buttonRef={pillRef}
              onOpen={() => goTo(guideUrl ? 'menu' : 'chat')}
              onWidthChange={setPillWidth}
            />
          )}
          {view === 'menu' && guideUrl && (
            <MenuView guideUrl={guideUrl} askRef={askRef} onAsk={() => goTo('chat')} onClose={close} />
          )}
          {view === 'chat' && (
            <ChatPanel
              guideUrl={guideUrl}
              inputRef={inputRef}
              entries={entries}
              pending={pending}
              retryableId={retryableId}
              draft={draft}
              onDraftChange={setDraft}
              onSend={sendDraft}
              onReply={announce}
              onFailure={announceFailure}
              onRetry={retryQuestion}
              onNewConversation={startNewConversation}
              onClose={close}
            />
          )}
        </Box>
      </Box>
      <WidgetSeal placement={layout.seal} />
      <Box role="status" sx={visuallyHidden}>
        {announcement}
      </Box>
    </Box>
  )
}

export default HelpChatbot
