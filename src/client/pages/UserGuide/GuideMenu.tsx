import { ExpandLess, ExpandMore } from '@mui/icons-material'
import { Box, GlobalStyles, Link, Typography } from '@mui/material'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useLocation } from 'react-router-dom'

import type { GuidePage } from './content'

import { NorButton } from '../../components/common/NorButton'
import { focusIndicatorStyle } from '../../util/accessibility'

const list = { listStyle: 'none', m: 0, p: 0 }

const TOP = 'calc(64px + 3rem)'

// Keeps the focus indicator from being cut off when the menu scrolls on its own
const PADDING = 6

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
    {current && page.sections.length > 0 && (
      <Box component="ul" sx={{ ...list, borderLeft: '3px solid', borderColor: 'divider' }}>
        {page.sections.map(section => (
          <li key={section.id}>
            <Link
              component={RouterLink}
              to={`/guide/${page.slug}#${section.id}`}
              underline="hover"
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
              {section.title}
            </Link>
          </li>
        ))}
      </Box>
    )}
  </li>
)

const GuideMenu = ({ pages, current }: { pages: GuidePage[]; current: GuidePage }) => {
  const { t } = useTranslation()
  const { key } = useLocation()
  const titleId = useId()
  const listId = useId()
  // The location the list was opened at, so following a link closes it
  const [openAt, setOpenAt] = useState<string>()
  const open = openAt === key

  return (
    <Box
      component="nav"
      aria-labelledby={titleId}
      sx={{
        position: { md: 'sticky' },
        top: { md: `calc(${TOP} - ${PADDING}px)` },
        // Fits the window, but shows at least a few items in a very low one
        maxHeight: { md: `max(10rem, calc(100vh - ${TOP} - 1rem))` },
        overflowY: { md: 'auto' },
        p: { md: `${PADDING}px` },
        m: { md: `-${PADDING}px` },
      }}
    >
      <GlobalStyles styles={{ html: { scrollPaddingTop: TOP } }} />
      <Typography
        id={titleId}
        component="h2"
        sx={{ mb: 1, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}
      >
        {t('userGuide:title')}
      </Typography>
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
        {pages.map(page => (
          <PageItem key={page.slug} page={page} current={page.slug === current.slug} />
        ))}
      </Box>
    </Box>
  )
}

export default GuideMenu
