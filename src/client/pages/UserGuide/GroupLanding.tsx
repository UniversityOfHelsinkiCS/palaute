import { Box } from '@mui/material'

import type { GuidePage } from './content'

import GuideCard, { GuideCardList } from './GuideCard'
import GuideMarkdown from './GuideMarkdown'

// A group's own page: its index.md and a card for each of its pages
const GroupLanding = ({ landing, pages, editUrl }: { landing: GuidePage; pages: GuidePage[]; editUrl?: string }) => {
  return (
    <>
      <Box sx={{ '& p': { maxWidth: '75ch' } }}>
        <GuideMarkdown page={landing} editUrl={editUrl} />
      </Box>
      <GuideCardList columns={2}>
        {pages.map(page => (
          <GuideCard key={page.slug} to={`/guide/${page.slug}`} title={page.title} description={page.description} />
        ))}
      </GuideCardList>
    </>
  )
}

export default GroupLanding
