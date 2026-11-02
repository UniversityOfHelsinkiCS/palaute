import { Box, Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import type { GuidePage } from './content'

import { focusIndicatorStyle } from '../../util/accessibility'
import GuideMarkdown from './GuideMarkdown'

const list = { listStyle: 'none', m: 0, p: 0 }

const PageEntry = ({ page }: { page: GuidePage }) => (
  <Box component="li" sx={{ py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
    <Typography component="h2" sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
      <Link component={RouterLink} to={`/guide/${page.slug}`} underline="hover" sx={focusIndicatorStyle()}>
        {page.title}
      </Link>
    </Typography>
    {page.sections.length > 0 && (
      <Box component="ul" sx={{ ...list, mt: 0.75, pl: 2 }}>
        {page.sections.map(section => (
          <li key={section.id}>
            <Link
              component={RouterLink}
              to={`/guide/${page.slug}#${section.id}`}
              underline="hover"
              sx={{ display: 'inline-block', py: 0.25, color: 'text.primary', ...focusIndicatorStyle() }}
            >
              {section.title}
            </Link>
          </li>
        ))}
      </Box>
    )}
  </Box>
)

// A group's own page: its index.md and the contents of its pages
const GroupLanding = ({ landing, pages, editUrl }: { landing: GuidePage; pages: GuidePage[]; editUrl?: string }) => (
  <>
    <GuideMarkdown page={landing} editUrl={editUrl} />
    <Box component="ul" sx={{ ...list, mt: 3 }}>
      {pages.map(page => (
        <PageEntry key={page.slug} page={page} />
      ))}
    </Box>
  </>
)

export default GroupLanding
