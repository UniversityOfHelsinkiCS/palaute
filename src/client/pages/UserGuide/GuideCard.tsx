import type { ReactNode } from 'react'

import { ArrowForward } from '@mui/icons-material'
import { Box, Link, Typography } from '@mui/material'
import { useId } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { focusIndicatorStyle } from '../../util/accessibility'

// For the parts that open a page: a grey background, and the arrow (className "arrow") nudged the way it points
export const clickableHover = (direction: 1 | -1 = 1) => ({
  transition: 'background-color 150ms',
  '& .arrow': { transition: 'transform 150ms' },
  '&:hover': { bgcolor: 'action.hover' },
  '&:hover .arrow': { transform: `translateX(${direction * 4}px)` },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none', '& .arrow': { transition: 'none' } },
})

type GuideCardProps = {
  to: string
  // Before the title, as in the menu
  icon?: ReactNode
  title: string
  description?: string
  links: { to: string; label: string }[]
}

// A group on the home page or a page on its group's landing page, a full-width row so that cards of different
// lengths don't stand side by side. The left side opens it, the links on the right go into it.
const GuideCard = ({ to, icon, title, description, links }: GuideCardProps) => {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
        border: '1px solid',
        borderColor: 'grey.300',
        bgcolor: 'background.paper',
      }}
    >
      <Link
        component={RouterLink}
        to={to}
        underline="none"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        sx={{
          display: 'block',
          p: 2.5,
          color: 'text.primary',
          '&:hover h2': { textDecoration: 'underline' },
          ...clickableHover(),
          ...focusIndicatorStyle(),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
          {icon && <Box sx={{ display: 'flex', flexShrink: 0, width: 24, pt: '1px' }}>{icon}</Box>}
          <Typography
            id={titleId}
            component="h2"
            sx={{ minWidth: 0, fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, overflowWrap: 'anywhere' }}
          >
            {title}
          </Typography>
          <ArrowForward aria-hidden className="arrow" sx={{ flexShrink: 0, ml: 'auto', color: 'primary.main' }} />
        </Box>
        {description && (
          <Typography
            id={descriptionId}
            // Under the title, past the icon
            sx={{ mt: 0.75, pl: icon ? '34px' : 0, fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.5 }}
          >
            {description}
          </Typography>
        )}
      </Link>
      {links.length > 0 && (
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            mx: { xs: 2.5, lg: 0 },
            my: { lg: 2.5 },
            pt: { xs: 1, lg: 0 },
            pb: { xs: 1.5, lg: 0 },
            px: { lg: 2.5 },
            borderStyle: 'solid',
            borderColor: 'grey.300',
            // Above the list when stacked, beside it in a row
            borderWidth: { xs: '1px 0 0 0', lg: '0 0 0 1px' },
          }}
        >
          {links.map(link => (
            <li key={link.to}>
              <Link
                component={RouterLink}
                to={link.to}
                underline="hover"
                sx={{ display: 'block', py: 0.5, ...focusIndicatorStyle() }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </Box>
      )}
    </Box>
  )
}

export const GuideCardList = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'grid', gap: 2, mt: 3 }}>{children}</Box>
)

export default GuideCard
