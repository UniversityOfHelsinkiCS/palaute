import { Box, Link, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import type { GuidePage } from './content'

import { focusIndicatorStyle } from '../../util/accessibility'
import GuideMarkdown from './GuideMarkdown'

const PageLink = ({ page }: { page: GuidePage }) => (
  <li>
    <Link
      component={RouterLink}
      to={`/guide/${page.slug}`}
      underline="hover"
      sx={{ display: 'block', py: 0.5, ...focusIndicatorStyle() }}
    >
      {page.title}
    </Link>
  </li>
)

const GroupCard = ({ group, pages }: { group: string; pages: GuidePage[] }) => {
  const { t } = useTranslation()

  return (
    <Box
      component="section"
      sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}
    >
      <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
        {t(`userGuide:groups:${group}`)}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        {/* A version can describe a group of the same name differently */}
        {t([`userGuide:groupDescriptions:${pages[0].version}:${group}`, `userGuide:groupDescriptions:${group}`])}
      </Typography>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {pages.map(page => (
          <PageLink key={page.slug} page={page} />
        ))}
      </Box>
    </Box>
  )
}

const GuideHome = ({ pages, home, editUrl }: { pages: GuidePage[]; home: GuidePage; editUrl?: string }) => {
  const groups = [...new Set(pages.flatMap(page => page.group ?? []))]

  return (
    <>
      <GuideMarkdown page={home} editUrl={editUrl} />
      <Box sx={{ display: 'grid', gap: 2, mt: 3, gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' } }}>
        {groups.map(group => (
          <GroupCard key={group} group={group} pages={pages.filter(page => page.group === group)} />
        ))}
      </Box>
    </>
  )
}

export default GuideHome
