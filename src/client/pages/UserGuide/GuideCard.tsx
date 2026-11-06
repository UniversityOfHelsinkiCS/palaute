import type { ReactNode } from 'react'

import ArrowForward from '@mui/icons-material/ArrowForward'
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
  links?: { to: string; label: string }[]
}

// A group on the home page or a page on its group's landing page. The top opens it, the links below go into it.
// Without links, the whole card opens it.
const GuideCard = ({ to, icon, title, description, links = [] }: GuideCardProps) => {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        flexDirection: 'column',
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
          flexGrow: links.length > 0 ? 0 : 1,
          p: 2,
          color: 'text.primary',
          '&:hover h2': { textDecoration: 'underline' },
          ...clickableHover(),
          ...focusIndicatorStyle(),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          {icon && <Box sx={{ display: 'flex', flexShrink: 0, pt: '2px' }}>{icon}</Box>}
          <Typography
            id={titleId}
            component="h2"
            sx={{ minWidth: 0, fontSize: '1.0625rem', fontWeight: 700, lineHeight: 1.4, overflowWrap: 'anywhere' }}
          >
            {title}
          </Typography>
          <ArrowForward aria-hidden className="arrow" sx={{ flexShrink: 0, ml: 'auto', color: 'primary.main' }} />
        </Box>
        {description && (
          <Typography
            id={descriptionId}
            sx={{ mt: 0.75, fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.5 }}
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
            mx: 2,
            pt: 1,
            pb: 1.5,
            borderTop: '1px solid',
            borderTopColor: 'grey.300',
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

export const GuideCardList = ({ columns, children }: { columns: number; children: ReactNode }) => (
  <Box
    sx={{
      display: 'grid',
      gap: 2,
      mt: 3,
      gridTemplateColumns: { xs: '1fr', lg: `repeat(${columns}, minmax(0, 1fr))` },
    }}
  >
    {children}
  </Box>
)

export default GuideCard
