import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { Box, Link } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import type { GuidePage } from './content'

import { focusIndicatorStyle } from '../../util/accessibility'
import { clickableHover } from './GuideCard'

const PageLink = ({ page, label, align }: { page: GuidePage; label: string; align: 'left' | 'right' }) => (
  <Link
    component={RouterLink}
    to={`/guide/${page.slug}`}
    underline="none"
    sx={{
      display: 'flex',
      flexDirection: align === 'left' ? 'row' : 'row-reverse',
      alignItems: 'center',
      gap: 1.5,
      height: '100%',
      px: 2,
      py: 1.5,
      textAlign: align,
      fontWeight: 600,
      color: 'text.primary',
      border: '1px solid',
      borderColor: 'grey.300',
      bgcolor: 'background.paper',
      '&:hover .title': { textDecoration: 'underline' },
      ...clickableHover(align === 'left' ? -1 : 1),
      ...focusIndicatorStyle(),
    }}
  >
    {align === 'left' ? (
      <ArrowBack aria-hidden className="arrow" sx={{ color: 'primary.main' }} />
    ) : (
      <ArrowForward aria-hidden className="arrow" sx={{ color: 'primary.main' }} />
    )}
    <span>
      <Box component="span" sx={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'text.secondary' }}>
        {label}
        <Box component="span" sx={visuallyHidden}>
          :{' '}
        </Box>
      </Box>
      <span className="title">{page.title}</span>
    </span>
  </Link>
)

const PageNavigation = ({ previous, next }: { previous?: GuidePage; next?: GuidePage }) => {
  const { t } = useTranslation()

  return (
    <Box
      component="nav"
      aria-label={t('userGuide:pageNavigation')}
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2, mt: 6 }}
    >
      <div>{previous && <PageLink page={previous} label={t('userGuide:previous')} align="left" />}</div>
      <div>{next && <PageLink page={next} label={t('userGuide:next')} align="right" />}</div>
    </Box>
  )
}

export default PageNavigation
