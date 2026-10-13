import type { Theme } from '@mui/material'

import { ExpandLess, ExpandMore } from '@mui/icons-material'
import { Box, Link, Typography, useMediaQuery } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Link as RouterLink, useLocation, useParams } from 'react-router-dom'

import type { GuidePage } from './guidePages'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import { NorButton } from '../../components/common/NorButton'
import Title from '../../components/common/Title'
import useElementSize from '../../components/HelpChatbot/useElementSize'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { focusIndicatorStyle } from '../../util/accessibility'
import canSeeUserGuide from './canSeeUserGuide'
import GUIDE_PAGES from './content'
import GuideMarkdown from './GuideMarkdown'
import { getGuideLanguage } from './guidePages'

type PageListProps = {
  id?: string
  pages: GuidePage[]
  current: GuidePage
  onNavigate?: () => void
}

const listStyle = { listStyle: 'none', m: 0, p: 0 }

// Only the open page lists its sections, so the menu stays short enough to fit the window
const SectionList = ({ page, onNavigate }: { page: GuidePage; onNavigate?: () => void }) => (
  <Box component="ul" sx={{ ...listStyle, borderLeft: '3px solid', borderColor: 'divider' }}>
    {page.sections.map(({ id, title }) => (
      <li key={id}>
        <Link
          component={RouterLink}
          to={`/guide/${page.slug}#${id}`}
          underline="hover"
          onClick={onNavigate}
          sx={{
            display: 'block',
            py: 0.5,
            pl: 3,
            pr: 1.5,
            fontSize: '0.875rem',
            fontWeight: 400,
            color: 'text.primary',
            ...focusIndicatorStyle(),
          }}
        >
          {title}
        </Link>
      </li>
    ))}
  </Box>
)

const PageList = ({ id, pages, current, onNavigate }: PageListProps) => (
  <Box component="ul" id={id} sx={listStyle}>
    {pages.map(page => {
      const isCurrent = page.slug === current.slug
      return (
        <li key={page.slug}>
          <Link
            component={RouterLink}
            to={`/guide/${page.slug}`}
            aria-current={isCurrent ? 'page' : undefined}
            underline="hover"
            onClick={onNavigate}
            sx={{
              display: 'block',
              py: 0.75,
              px: 1.5,
              borderLeft: '3px solid',
              borderColor: isCurrent ? 'primary.main' : 'divider',
              color: isCurrent ? 'primary.main' : 'text.primary',
              fontWeight: isCurrent ? 600 : 400,
              ...focusIndicatorStyle(),
            }}
          >
            {page.title}
          </Link>
          {isCurrent && page.sections.length > 0 && <SectionList page={page} onNavigate={onNavigate} />}
        </li>
      )
    })}
  </Box>
)

type PageNavigationProps = {
  previous: GuidePage | undefined
  next: GuidePage | undefined
}

const PageNavigation = ({ previous, next }: PageNavigationProps) => {
  const { t } = useTranslation()

  // Read as e.g. "Next: Roles and rights", visible text first (WCAG 2.5.3)
  const pageLink = (page: GuidePage, label: string, align: 'left' | 'right') => (
    <Link
      component={RouterLink}
      to={`/guide/${page.slug}`}
      underline="hover"
      sx={{ display: 'block', textAlign: align, ...focusIndicatorStyle() }}
    >
      <Box component="span" sx={{ display: 'block', fontSize: '0.875rem', color: 'text.secondary' }}>
        {label}
        <Box component="span" sx={visuallyHidden}>
          :{' '}
        </Box>
      </Box>
      {page.title}
    </Link>
  )

  return (
    <Box
      component="nav"
      aria-label={t('userGuide:pageNavigation')}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        mt: 6,
        pt: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <div>{previous && pageLink(previous, t('userGuide:previous'), 'left')}</div>
      <div>{next && pageLink(next, t('userGuide:next'), 'right')}</div>
    </Box>
  )
}

// The menu's padding, which keeps the focus indicator from being cut off when the menu scrolls on its own
const MENU_PADDING = 6

// A sticky element can't reach below its container, so at the end of a long page the menu would be pushed up under the
// header. There it gets shorter instead, and scrolls on its own if it no longer fits
const updateMenuHeight = (root: HTMLElement) => {
  const top = parseFloat(root.style.getPropertyValue('--guide-top'))
  if (Number.isNaN(top)) return
  const bottom = Math.min(window.innerHeight - 16, root.getBoundingClientRect().bottom + 2 * MENU_PADDING)
  const height = `${Math.max(bottom - top, 160)}px`
  if (root.style.getPropertyValue('--guide-menu-height') !== height)
    root.style.setProperty('--guide-menu-height', height)
}

// The section a link leads to. A malformed address, e.g. a broken percent-encoding, leads to none
const findSection = (hash: string) => {
  try {
    return hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
  } catch {
    return null
  }
}

const UserGuide = () => {
  const { t, i18n } = useTranslation()
  const { authorizedUser, isLoading } = useAuthorizedUser()
  const { slug } = useParams()
  const { hash, key } = useLocation()
  const compact = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const [menuOpen, setMenuOpen] = useState(false)
  const listId = useId()
  const navTitleId = useId()
  const contentRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  const rootRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef(document.getElementById('header'))

  // The menu sticks where it already is at the top of the page, below the app's sticky header. Whatever the page
  // scrolls to, a linked section or an element focused with the keyboard, stops at the same height instead of under
  // the header (WCAG 2.4.11). Set before the scroll effect below, and again if the header changes size
  const updateLayout = () => {
    const root = rootRef.current
    if (!root) return
    const top = `${root.getBoundingClientRect().top + window.scrollY}px`
    if (root.style.getPropertyValue('--guide-top') !== top) root.style.setProperty('--guide-top', top)
    const { style } = document.documentElement
    if (style.scrollPaddingTop !== top) style.scrollPaddingTop = top
    if (!compact) updateMenuHeight(root)
  }
  useLayoutEffect(updateLayout)
  useElementSize(headerRef, updateLayout)
  useEffect(
    () => () => {
      document.documentElement.style.scrollPaddingTop = ''
    },
    []
  )

  // The menu's height follows the scroll position, the window's height and the page's height (e.g. when the text
  // rewraps). Not on small screens, where the menu doesn't stick
  useEffect(() => {
    if (compact) return undefined
    let frame = 0
    const update = () => {
      frame ||= requestAnimationFrame(() => {
        frame = 0
        if (rootRef.current) updateMenuHeight(rootRef.current)
      })
    }
    const observer = new ResizeObserver(update)
    observer.observe(document.body)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      cancelAnimationFrame(frame)
    }
  }, [compact])

  const pages = GUIDE_PAGES[getGuideLanguage(i18n.language)]
  const index = slug ? pages.findIndex(candidate => candidate.slug === slug) : 0
  const page = index >= 0 ? pages[index] : undefined
  const shown = !isLoading && canSeeUserGuide(authorizedUser) && page !== undefined

  // Like a page load: start from the given section or the top. After following a link, also move focus to the section
  // or the page's title, so keyboard and screen reader users go on from there. The key reruns this when the same
  // link is followed again
  useEffect(() => {
    if (!shown) return
    const section = findSection(hash)
    if (section) {
      section.scrollIntoView()
    } else if (!firstRender.current) {
      window.scrollTo(0, 0)
    }
    if (!firstRender.current) {
      ;(section ?? contentRef.current?.querySelector<HTMLElement>('h1'))?.focus({ preventScroll: true })
    }
    firstRender.current = false
  }, [shown, page?.slug, hash, key])

  if (isLoading) return <LoadingProgress />
  if (!canSeeUserGuide(authorizedUser)) return <Navigate to="/" replace />
  if (!page) return <Navigate to="/guide" replace />

  return (
    <Box
      ref={rootRef}
      sx={{
        display: 'grid',
        gap: { xs: 2, md: 6 },
        gridTemplateColumns: { xs: '1fr', md: '16rem minmax(0, 1fr)' },
        alignItems: 'start',
      }}
    >
      <Title>{`${page.title} – ${t('userGuide:title')}`}</Title>
      <Box
        component="nav"
        aria-labelledby={navTitleId}
        sx={{
          position: { md: 'sticky' },
          top: { md: `calc(var(--guide-top) - ${MENU_PADDING}px)` },
          maxHeight: { md: 'var(--guide-menu-height)' },
          overflowY: { md: 'auto' },
          p: { md: `${MENU_PADDING}px` },
          m: { md: `-${MENU_PADDING}px` },
        }}
      >
        <Typography
          id={navTitleId}
          component="h2"
          sx={{ mb: 1, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}
        >
          {t('userGuide:title')}
        </Typography>
        {/* Collapsed on small screens, so the list doesn't push the page's text below the fold */}
        {compact ? (
          <>
            <NorButton
              color="secondary"
              icon={menuOpen ? <ExpandLess /> : <ExpandMore />}
              aria-expanded={menuOpen}
              aria-controls={listId}
              onClick={() => setMenuOpen(open => !open)}
            >
              {t('userGuide:contents')}
            </NorButton>
            <Box sx={{ mt: 1 }} hidden={!menuOpen}>
              <PageList id={listId} pages={pages} current={page} onNavigate={() => setMenuOpen(false)} />
            </Box>
          </>
        ) : (
          <PageList pages={pages} current={page} />
        )}
      </Box>
      <Box sx={{ maxWidth: '75ch', minWidth: 0 }}>
        <Box component="article" ref={contentRef}>
          <GuideMarkdown markdown={page.markdown} />
        </Box>
        <PageNavigation previous={pages[index - 1]} next={pages[index + 1]} />
      </Box>
    </Box>
  )
}

export default UserGuide
