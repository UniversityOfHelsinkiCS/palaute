import { Box, Link } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import type { GuidePage } from './content'

import { focusIndicatorStyle } from '../../util/accessibility'

const PageLink = ({ page, label, align }: { page: GuidePage; label: string; align: 'left' | 'right' }) => (
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

const PageNavigation = ({ previous, next }: { previous?: GuidePage; next?: GuidePage }) => {
  const { t } = useTranslation()

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
      <div>{previous && <PageLink page={previous} label={t('userGuide:previous')} align="left" />}</div>
      <div>{next && <PageLink page={next} label={t('userGuide:next')} align="right" />}</div>
    </Box>
  )
}

export default PageNavigation
