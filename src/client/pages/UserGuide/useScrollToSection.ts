import type { RefObject } from 'react'

import { useEffect, useRef } from 'react'
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom'

// decodeURIComponent throws on a malformed address, e.g. a broken percent-encoding
const findSection = (hash: string) => {
  try {
    return hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
  } catch {
    return null
  }
}

// The router doesn't scroll like a page load does. After following a link, focus moves to where it led too, as the
// link may be gone. The location's key changes on every navigation, also when the same link is followed again.
const useScrollToSection = (articleRef: RefObject<HTMLElement | null>) => {
  const { hash, key } = useLocation()
  const navigationType = useNavigationType()
  const followedLink = useRef(false)

  useEffect(() => {
    // Back and forward return to where the reader was, which the browser restores
    if (followedLink.current && navigationType === NavigationType.Pop) return
    const section = findSection(hash)
    if (section) {
      section.scrollIntoView()
    } else if (followedLink.current) {
      window.scrollTo(0, 0)
    }
    if (followedLink.current) {
      const target = section ?? articleRef.current?.querySelector<HTMLElement>('h1')
      target?.focus({ preventScroll: true })
    }
    followedLink.current = true
  }, [articleRef, hash, key, navigationType])
}

export default useScrollToSection
