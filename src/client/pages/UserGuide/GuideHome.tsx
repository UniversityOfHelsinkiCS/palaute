import { Box, Link, Typography } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import type { GuidePage } from './content'

import { focusIndicatorStyle } from '../../util/accessibility'

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

const GuideHome = ({ pages }: { pages: GuidePage[] }) => {
  const { t } = useTranslation()
  const groups = [...new Set(pages.flatMap(page => page.group ?? []))]
  // Pages outside the groups get a sentence of their own, as no card lists them
  const help = pages.find(page => page.slug === 'help' && !page.group)
  const videos = pages.find(page => page.slug === 'videos')
  const pointers = [
    ...(videos ? [{ text: t('userGuide:homeVideos'), page: videos }] : []),
    ...(help ? [{ text: t('userGuide:homeHelp'), page: help }] : []),
  ]

  return (
    <>
      {/* Focused after moving to the page (useScrollToSection) */}
      <Typography variant="h4" component="h1" tabIndex={-1} sx={{ mb: 2, '&:focus': { outline: 'none' } }}>
        {t('userGuide:title')}
      </Typography>
      <Box sx={{ mb: 3, '& > p + p': { mt: 1 } }}>
        <Typography variant="body1">
          <Trans
            i18nKey="userGuide:homeIntro"
            components={{
              gettingStarted: (
                <Link
                  key="gettingStarted"
                  component={RouterLink}
                  to="/guide/getting-started"
                  sx={focusIndicatorStyle()}
                />
              ),
            }}
          />
        </Typography>
        {pointers.map(({ text, page }) => (
          <Typography key={page.slug} variant="body1">
            {`${text} `}
            <Link component={RouterLink} to={`/guide/${page.slug}`} sx={focusIndicatorStyle()}>
              {page.title}
            </Link>
            .
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' } }}>
        {groups.map(group => (
          <GroupCard key={group} group={group} pages={pages.filter(page => page.group === group)} />
        ))}
      </Box>
    </>
  )
}

export default GuideHome
