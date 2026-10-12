import type { Theme } from '@mui/material'

import { ExpandLess, ExpandMore } from '@mui/icons-material'
import { Box, Link, Typography, useMediaQuery } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Link as RouterLink, useLocation, useParams } from 'react-router-dom'

import type { GuidePage } from './guidePages'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import { NorButton } from '../../components/common/NorButton'
import Title from '../../components/common/Title'
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

const PageList = ({ id, pages, current, onNavigate }: PageListProps) => (
  <Box component="ul" id={id} sx={{ listStyle: 'none', m: 0, p: 0 }}>
    {pages.map(({ slug, title }) => {
      const isCurrent = slug === current.slug
      return (
        <li key={slug}>
          <Link
            component={RouterLink}
            to={`/guide/${slug}`}
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
            {title}
          </Link>
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

const UserGuide = () => {
  const { t, i18n } = useTranslation()
  const { authorizedUser, isLoading } = useAuthorizedUser()
  const { slug } = useParams()
  const { hash } = useLocation()
  const compact = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const [menuOpen, setMenuOpen] = useState(false)
  const listId = useId()
  const navTitleId = useId()
  const contentRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  const pages = GUIDE_PAGES[getGuideLanguage(i18n.language)]
  const index = slug ? pages.findIndex(candidate => candidate.slug === slug) : 0
  const page = index >= 0 ? pages[index] : undefined

  // Like a page load: start from the given section or the top. After moving to another page, focus its title,
  // as the link that was activated may be gone
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
    if (target) {
      target.scrollIntoView()
    } else if (!firstRender.current) {
      window.scrollTo(0, 0)
    }
    if (!firstRender.current) contentRef.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true })
    firstRender.current = false
  }, [page?.slug, hash])

  if (isLoading) return <LoadingProgress />
  if (!canSeeUserGuide(authorizedUser)) return <Navigate to="/" replace />
  if (!page) return <Navigate to="/guide" replace />

  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2, md: 6 },
        gridTemplateColumns: { xs: '1fr', md: '16rem minmax(0, 1fr)' },
        alignItems: 'start',
      }}
    >
      <Title>{`${page.title} – ${t('userGuide:title')}`}</Title>
      <Box component="nav" aria-labelledby={navTitleId} sx={{ position: { md: 'sticky' }, top: '1rem' }}>
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
