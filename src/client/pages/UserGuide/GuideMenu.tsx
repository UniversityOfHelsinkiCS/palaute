import type { ReactNode } from 'react'

import { ChevronRight, ExpandLess, ExpandMore, HomeOutlined } from '@mui/icons-material'
import { Box, Link } from '@mui/material'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useLocation } from 'react-router-dom'

import type { GuidePage } from './content'

import { NorButton } from '../../components/common/NorButton'
import { HEADER_BOTTOM, PAGE_TOP_GAP } from '../../hooks/useHeaderHeight'
import { FOCUS_INDICATOR_REACH, focusIndicatorStyle } from '../../util/accessibility'
import { groupsOf } from './content'
import PageIcon from './PageIcon'
import SearchField from './SearchField'

const list = { listStyle: 'none', m: 0, p: 0 }

// Keeps the focus indicator from being cut off when the menu scrolls on its own
const PADDING = FOCUS_INDICATOR_REACH

const PageItem = ({ page, current }: { page: GuidePage; current: boolean }) => (
  <li>
    <Link
      component={RouterLink}
      to={`/guide/${page.slug}`}
      aria-current={current ? 'page' : undefined}
      underline="none"
      sx={{
        display: 'block',
        py: 0.75,
        px: 1.5,
        borderLeft: '2px solid',
        borderColor: current ? 'primary.main' : 'divider',
        fontSize: '0.9375rem',
        color: current ? 'primary.main' : 'text.secondary',
        fontWeight: current ? 700 : 500,
        '&:hover': { color: current ? 'primary.main' : 'text.primary' },
        ...focusIndicatorStyle(),
      }}
    >
      {page.title}
    </Link>
  </li>
)

type MenuLinkProps = {
  to: string
  icon: ReactNode
  label: string
  current: boolean
  // Only for a group, whose pages are listed under it while the reader is in the group
  expanded?: boolean
}

const MenuLink = ({ to, icon, label, current, expanded }: MenuLinkProps) => {
  let chevron: ReactNode = null
  if (expanded !== undefined) {
    const Chevron = expanded ? ExpandMore : ChevronRight
    chevron = <Chevron fontSize="small" sx={{ ml: 'auto', color: 'text.disabled' }} />
  }

  return (
    <Link
      component={RouterLink}
      to={to}
      aria-current={current ? 'page' : undefined}
      underline="none"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        px: 1.5,
        borderRadius: 1,
        fontWeight: 600,
        color: current ? 'primary.main' : 'text.primary',
        bgcolor: current ? 'action.selected' : undefined,
        '& > svg:first-of-type': { color: current ? 'primary.main' : 'text.secondary' },
        '&:hover': { bgcolor: current ? 'action.selected' : 'action.hover' },
        ...focusIndicatorStyle(),
      }}
    >
      {icon}
      {label}
      {chevron}
    </Link>
  )
}

// The menu's parts: the home page, the groups and the pages outside them
const part = { ...list, '& + &': { mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' } }

type GuideMenuProps = {
  pages: GuidePage[]
  current?: GuidePage
  query: string
}

const GuideMenu = ({ pages, current, query }: GuideMenuProps) => {
  const { t } = useTranslation()
  const { key } = useLocation()
  const listId = useId()
  // The location the list was opened at, so following a link closes it
  const [openAt, setOpenAt] = useState<string>()
  const open = openAt === key

  return (
    <Box
      component="nav"
      aria-label={t('userGuide:title')}
      sx={{
        position: { md: 'sticky' },
        top: { md: HEADER_BOTTOM },
        // Fills the window below the header, but shows at least a few items in a very low one
        maxHeight: { md: `max(10rem, calc(100vh - ${HEADER_BOTTOM}))` },
        overflowY: { md: 'auto' },
        // The page's space above and some below are inside the menu, so they scroll with it. It starts right below
        // the header, where it sticks, as its height only fits from there.
        mt: { md: `-${PAGE_TOP_GAP}` },
        pt: { md: PAGE_TOP_GAP },
        pb: { md: '1rem' },
        px: { md: `${PADDING}px` },
        mx: { md: `-${PADDING}px` },
      }}
    >
      <SearchField query={query} />
      <NorButton
        color="secondary"
        icon={open ? <ExpandLess /> : <ExpandMore />}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpenAt(open ? undefined : key)}
        sx={{ display: { md: 'none' }, mb: 1 }}
      >
        {t('userGuide:contents')}
      </NorButton>
      <Box id={listId} sx={{ display: { xs: open ? 'block' : 'none', md: 'block' } }}>
        <Box component="ul" sx={part}>
          <li>
            <MenuLink
              to="/guide"
              icon={<HomeOutlined fontSize="small" />}
              label={t('userGuide:title')}
              current={!current && !query}
            />
          </li>
        </Box>
        <Box component="ul" sx={part}>
          {groupsOf(pages).map(({ landing, pages: groupPages }) => {
            const expanded = current?.group === landing.group
            return (
              <li key={landing.slug}>
                <MenuLink
                  to={`/guide/${landing.slug}`}
                  icon={<PageIcon slug={landing.slug} />}
                  label={landing.title}
                  current={landing.slug === current?.slug}
                  expanded={expanded}
                />
                {expanded && (
                  <Box component="ul" sx={{ ...list, ml: '21px', my: 0.5 }}>
                    {groupPages.map(page => (
                      <PageItem key={page.slug} page={page} current={page.slug === current?.slug} />
                    ))}
                  </Box>
                )}
              </li>
            )
          })}
        </Box>
        <Box component="ul" sx={part}>
          {pages
            .filter(page => !page.group)
            .map(page => (
              <li key={page.slug}>
                <MenuLink
                  to={`/guide/${page.slug}`}
                  icon={<PageIcon slug={page.slug} />}
                  label={page.title}
                  current={page.slug === current?.slug}
                />
              </li>
            ))}
        </Box>
      </Box>
    </Box>
  )
}

export default GuideMenu
