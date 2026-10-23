import type { Theme } from '@mui/material'
import type { SystemStyleObject } from '@mui/system'
import type { ComponentProps, ReactNode } from 'react'
import type { Components, ExtraProps } from 'react-markdown'

import { EditOutlined } from '@mui/icons-material'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { createContext, memo, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import Markdown from '../../components/common/Markdown'
import MarkdownLink from '../../components/common/MarkdownLink'
import { HEADING_ID, LABEL, VIDEO } from './content'
import GuideVideo from './GuideVideo'

const renderLabels = (markdown: string, translate: (key: string, language?: string) => string) =>
  markdown.replace(LABEL, (_, key: string, pinned?: string) => `**${translate(key, pinned).replace(/<[^>]*>/g, '')}**`)

// The parts of a hast tree the plugins need; the hast types are only a transitive dependency
type HastNode = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

const rehypeHeadingIds = () => (tree: HastNode) => {
  const visit = (node: HastNode) => {
    if (node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? '')) {
      const last = node.children?.at(-1)
      const match = last?.type === 'text' ? HEADING_ID.exec(last.value ?? '') : null
      if (last && match) {
        last.value = last.value?.replace(HEADING_ID, '')
        node.properties = { ...node.properties, id: match[1] }
      }
    }
    node.children?.forEach(visit)
  }
  visit(tree)
}

// A paragraph of just [[video:slug]] becomes a video
const rehypeVideos = () => (tree: HastNode) => {
  const visit = (node: HastNode) => {
    node.children = node.children?.map(child => {
      const only = child.tagName === 'p' && child.children?.length === 1 ? child.children[0] : undefined
      const match = only?.type === 'text' ? VIDEO.exec(only.value ?? '') : null
      if (match) return { type: 'element', tagName: 'video', properties: { dataSlug: match[1] }, children: [] }
      visit(child)
      return child
    })
  }
  visit(tree)
}

type HeadingProps = ComponentProps<'h1'> & ExtraProps

const EditUrlContext = createContext<string | undefined>(undefined)
// The guide's language, which can differ from the UI's
const LanguageContext = createContext('en')

const EditLink = ({ href }: { href: string }) => {
  const { t } = useTranslation()

  return (
    <Tooltip title={t('userGuide:editOnGitHub')}>
      <IconButton component="a" href={href} target="_blank" rel="noopener noreferrer" size="small" sx={{ mt: 0.75 }}>
        <EditOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}

// Focused after moving to the page (useScrollToSection)
const H1 = ({ id, children }: HeadingProps) => {
  const editUrl = useContext(EditUrlContext)

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 3 }}>
      <Typography variant="h4" component="h1" id={id} tabIndex={-1} sx={{ '&:focus': { outline: 'none' } }}>
        {children}
      </Typography>
      {editUrl && <EditLink href={editUrl} />}
    </Box>
  )
}

// Focused when a link leads to the section (useScrollToSection)
const sectionProps = (id: string | undefined, sx: SystemStyleObject<Theme>) => ({
  id,
  tabIndex: id ? -1 : undefined,
  sx: { ...sx, '&:focus': { outline: 'none' } },
})

const H2 = ({ id, children }: HeadingProps) => (
  <Typography variant="h5" component="h2" {...sectionProps(id, { mt: 4, mb: 1.5 })}>
    {children}
  </Typography>
)

const H3 = ({ id, children }: HeadingProps) => (
  <Typography variant="h6" component="h3" {...sectionProps(id, { mt: 3, mb: 1, fontSize: '1.1rem', fontWeight: 600 })}>
    {children}
  </Typography>
)

const H4 = ({ id, children }: HeadingProps) => (
  <Typography variant="body1" component="h4" {...sectionProps(id, { mt: 2, mb: 1, fontWeight: 600 })}>
    {children}
  </Typography>
)

const P = ({ children }: ComponentProps<'p'> & ExtraProps) => (
  <Typography variant="body1" component="p" sx={{ mb: 1.5 }}>
    {children}
  </Typography>
)

const Video = ({ node }: ComponentProps<'video'> & ExtraProps) => {
  const language = useContext(LanguageContext)

  return <GuideVideo slug={String(node?.properties.dataSlug)} language={language} />
}

const List = ({ component, children }: { component: 'ul' | 'ol'; children?: ReactNode }) => (
  <Box component={component} sx={{ mt: 0, mb: 1.5, pl: 3, '& li': { mb: 0.5 }, '& li > p': { mb: 0.5 } }}>
    {children}
  </Box>
)

const Blockquote = ({ children }: ComponentProps<'blockquote'> & ExtraProps) => (
  <Box
    component="aside"
    sx={{
      my: 2,
      px: 2,
      py: 1.5,
      borderLeft: '4px solid',
      borderColor: 'primary.main',
      bgcolor: 'action.hover',
      borderRadius: 1,
      '& p:last-child': { mb: 0 },
    }}
  >
    {children}
  </Box>
)

// Passing components replaces all of Markdown's defaults, so this is the full set
const components: Components = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H4,
  h6: H4,
  p: P,
  ul: ({ children }) => <List component="ul">{children}</List>,
  ol: ({ children }) => <List component="ol">{children}</List>,
  blockquote: Blockquote,
  a: MarkdownLink,
  video: Video,
}

type GuideMarkdownProps = {
  markdown: string
  editUrl?: string
  language: string
}

const GuideMarkdown = ({ markdown, editUrl, language }: GuideMarkdownProps) => {
  const { t, i18n } = useTranslation()
  const translate = (key: string, language?: string) => (language ? i18n.getFixedT(language)(key) : t(key))

  return (
    <EditUrlContext.Provider value={editUrl}>
      <LanguageContext.Provider value={language}>
        <Markdown components={components} rehypePlugins={[rehypeHeadingIds, rehypeVideos]} disallowedElements={['img']}>
          {renderLabels(markdown, translate)}
        </Markdown>
      </LanguageContext.Provider>
    </EditUrlContext.Provider>
  )
}

// Memoised, so opening the menu on a small screen doesn't parse the whole page again
export default memo(GuideMarkdown)
