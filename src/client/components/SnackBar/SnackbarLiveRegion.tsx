import { Box } from '@mui/material'
import React from 'react'

import { subscribeToAnnouncements } from './snackbarAnnouncer'

/**
 * A live region that stays mounted for the whole session. Screen readers only announce
 * changes to a live region that already exists, so the region cannot be part of the
 * snackbar itself: it has to be here, waiting, before a snackbar appears.
 *
 * An open MUI dialog marks everything outside itself aria-hidden, and a change inside an
 * aria-hidden subtree is not announced. A message that arrives while a dialog is open is
 * therefore held back and written to the region once the dialog has closed.
 */
const SnackbarLiveRegion = () => {
  const [message, setMessage] = React.useState('')
  const regionRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    let clearTimer: ReturnType<typeof setTimeout>
    let writeTimer: ReturnType<typeof setTimeout>
    let pending: string | null = null

    const isHidden = () => Boolean(regionRef.current?.closest('[aria-hidden="true"]'))

    const flush = () => {
      if (pending === null || isHidden()) return

      const announcement = pending
      pending = null

      // Writing the message in the same tick as the dialog unmounting and moving focus
      // back can make the update go unnoticed, so let the teardown settle first
      clearTimeout(writeTimer)
      writeTimer = setTimeout(() => {
        setMessage(announcement)
        // Emptying the region again means the same message announced twice in a row
        // is still a change, and so is still announced the second time
        clearTimeout(clearTimer)
        clearTimer = setTimeout(() => setMessage(''), 5000)
      }, 300)
    }

    const unsubscribe = subscribeToAnnouncements(announcement => {
      pending = announcement
      flush()
    })

    // Notices the moment a closing dialog stops hiding the region
    const observer = new MutationObserver(flush)
    observer.observe(document.body, { attributes: true, attributeFilter: ['aria-hidden'], subtree: true })

    return () => {
      clearTimeout(clearTimer)
      clearTimeout(writeTimer)
      observer.disconnect()
      unsubscribe()
    }
  }, [])

  return (
    <Box
      ref={regionRef}
      aria-live="polite"
      aria-atomic="true"
      sx={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </Box>
  )
}

export default SnackbarLiveRegion
