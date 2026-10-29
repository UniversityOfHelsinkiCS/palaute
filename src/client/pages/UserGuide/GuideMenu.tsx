import type { ReactNode } from 'react'

import { ExpandLess, ExpandMore, HomeOutlined } from '@mui/icons-material'
import { Box, Link, Typography } from '@mui/material'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useLocation } from 'react-router-dom'

import type { GuidePage } from './content'

import { NorButton } from '../../components/common/NorButton'
import { FOCUS_INDICATOR_REACH, focusIndicatorStyle } from '../../util/accessibility'
import PageIcon from './PageIcon'
import { BELOW_HEADER } from './useHeaderHeight'

const list = { listStyle: 'none', m: 0, p: 0 }

// Keeps the focus indicator from being cut off when the menu scrolls on its own
const PADDING = FOCUS_INDICATOR_REACH

const PageItem = ({ page, current }: { page: GuidePage; current: boolean }) => (
  <li>
    <Link
      component={RouterLink}
      to={`/guide/${page.slug}`}
      aria-current={current ? 'page' : undefined}
      underline="hover"
      sx={{
        display: 'block',
        py: 0.75,
        px: 1.5,
        borderLeft: '3px solid',
        borderColor: current ? 'primary.main' : 'divider',
        color: current ? 'primary.main' : 'text.primary',
        fontWeight: current ? 600 : 400,
        ...focusIndicatorStyle(),
      }}
    >
      {page.title}
    </Link>
  </li>
)

// The home page and the pages outside the groups, above the groups and always shown
const Shortcut = ({ to, icon, label, current }: { to: string; icon: ReactNode; label: string; current: boolean }) => (
  <li>
    <Link
      component={RouterLink}
      to={to}
      aria-current={current ? 'page' : undefined}
      underline="hover"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        px: 1.5,
        borderRadius: 1,
        fontWeight: 600,
        color: 'primary.main',
        bgcolor: current ? 'action.selected' : undefined,
        '&:hover': { bgcolor: 'action.hover' },
        ...focusIndicatorStyle(),
      }}
    >
      {icon}
      {label}
    </Link>
  </li>
)

const GuideMenu = ({ pages, current }: { pages: GuidePage[]; current?: GuidePage }) => {
  const { t } = useTranslation()
  const { key } = useLocation()
  const listId = useId()
  // The location the list was opened at, so following a link closes it
  const [openAt, setOpenAt] = useState<string>()
  const open = openAt === key
  const groups = [...new Set(pages.flatMap(page => page.group ?? []))]

  return (
    <Box
      component="nav"
      aria-label={t('userGuide:title')}
      sx={{
        position: { md: 'sticky' },
        top: { md: `calc(${BELOW_HEADER} - ${PADDING}px)` },
        // Fits the window, but shows at least a few items in a very low one
        maxHeight: { md: `max(10rem, calc(100vh - ${BELOW_HEADER} - 1rem))` },
        overflowY: { md: 'auto' },
        p: { md: `${PADDING}px` },
        m: { md: `-${PADDING}px` },
      }}
    >
      <Box component="ul" sx={{ ...list, mb: 2 }}>
        <Shortcut
          to="/guide"
          icon={<HomeOutlined fontSize="small" />}
          label={t('userGuide:title')}
          current={!current}
        />
        {pages
          .filter(page => !page.group)
          .map(page => (
            <Shortcut
              key={page.slug}
              to={`/guide/${page.slug}`}
              icon={<PageIcon slug={page.slug} />}
              label={page.title}
              current={page.slug === current?.slug}
            />
          ))}
      </Box>
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
      <Box component="ul" id={listId} sx={{ ...list, display: { xs: open ? 'block' : 'none', md: 'block' } }}>
        {groups.map(group => (
          <Box component="li" key={group} sx={{ '& + &': { mt: 2 } }}>
            <Typography component="h2" sx={{ mb: 0.5, fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary' }}>
              {t(`userGuide:groups:${group}`)}
            </Typography>
            <Box component="ul" sx={list}>
              {pages
                .filter(page => page.group === group)
                .map(page => (
                  <PageItem key={page.slug} page={page} current={page.slug === current?.slug} />
                ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default GuideMenu
