import { useCallback, useEffect, useRef, useState } from 'react'

const CLEAR_AFTER_MS = 5000

// Text for an always-mounted polite live region. Cleared afterwards, and emptied for a frame before
// each message, so that repeating the same message is announced again.
const useAnnouncer = () => {
  const [message, setMessage] = useState('')
  const clearTimer = useRef<number | undefined>(undefined)
  const frame = useRef<number | undefined>(undefined)

  const announce = useCallback((text: string) => {
    window.clearTimeout(clearTimer.current)
    window.cancelAnimationFrame(frame.current ?? 0)
    setMessage('')
    frame.current = window.requestAnimationFrame(() => {
      setMessage(text)
      clearTimer.current = window.setTimeout(() => setMessage(''), CLEAR_AFTER_MS)
    })
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(clearTimer.current)
      window.cancelAnimationFrame(frame.current ?? 0)
    },
    []
  )

  return { message, announce }
}

export default useAnnouncer
