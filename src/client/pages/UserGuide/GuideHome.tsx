import { Box } from '@mui/material'

import type { GuidePage } from './content'

import { groupsOf } from './content'
import GuideCard, { GuideCardList } from './GuideCard'
import GuideMarkdown from './GuideMarkdown'
import PageIcon from './PageIcon'

const GuideHome = ({ pages, home, editUrl }: { pages: GuidePage[]; home: GuidePage; editUrl?: string }) => {
  return (
    <>
      <Box sx={{ '& p': { maxWidth: '75ch' } }}>
        <GuideMarkdown page={home} editUrl={editUrl} />
      </Box>
      <GuideCardList columns={3}>
        {groupsOf(pages).map(({ landing, pages: groupPages }) => (
          <GuideCard
            key={landing.slug}
            to={`/guide/${landing.slug}`}
            title={landing.title}
            icon={<PageIcon slug={landing.slug} />}
            links={groupPages.map(page => ({ to: `/guide/${page.slug}`, label: page.title }))}
          />
        ))}
      </GuideCardList>
    </>
  )
}

export default GuideHome
