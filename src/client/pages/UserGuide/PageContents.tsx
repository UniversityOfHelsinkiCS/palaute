import { Box, Link, Typography } from '@mui/material'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import type { GuidePage } from './content'

import { focusIndicatorStyle } from '../../util/accessibility'
import useActiveSection from './useActiveSection'
import { BELOW_HEADER } from './useHeaderHeight'

const SectionLink = ({ page, id, title, active }: { page: GuidePage; id: string; title: string; active: boolean }) => (
  <li>
    <Link
      component={RouterLink}
      to={`/guide/${page.slug}#${id}`}
      underline="hover"
      sx={{
        display: 'block',
        py: 0.5,
        px: 1.5,
        borderLeft: '3px solid',
        borderColor: active ? 'primary.main' : 'divider',
        fontSize: '0.875rem',
        color: active ? 'primary.main' : 'text.primary',
        ...focusIndicatorStyle(),
      }}
    >
      {title}
    </Link>
  </li>
)

const Contents = ({ page, activeSection }: { page: GuidePage; activeSection?: string }) => {
  const { t } = useTranslation()
  const titleId = useId()

  return (
    <nav aria-labelledby={titleId}>
      <Typography
        id={titleId}
        component="h2"
        sx={{ mb: 1, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}
      >
        {t('userGuide:onThisPage')}
      </Typography>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {page.sections.map(section => (
          <SectionLink key={section.id} page={page} {...section} active={section.id === activeSection} />
        ))}
      </Box>
    </nav>
  )
}

// Beside the page on wide screens, following the reader through it
export const PageContentsAside = ({ page }: { page: GuidePage }) => {
  const activeSection = useActiveSection(page.sections)
  if (page.sections.length === 0) return null

  return (
    <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'sticky', top: BELOW_HEADER }}>
      <Contents page={page} activeSection={activeSection} />
    </Box>
  )
}

// Under the page's title on narrower screens
export const PageContentsInline = ({ page }: { page: GuidePage }) => {
  if (page.sections.length === 0) return null

  return (
    <Box sx={{ display: { lg: 'none' }, mb: 3 }}>
      <Contents page={page} />
    </Box>
  )
}
