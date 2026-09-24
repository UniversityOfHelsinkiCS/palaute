import type { ComponentProps } from 'react'
import type { Components, ExtraProps } from 'react-markdown'

import { Box, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import ExternalLink from '../common/ExternalLink'
import Markdown from '../common/Markdown'

// The panel's title is an h2, so reply headings start at h3
const SectionHeading = ({ children }: ExtraProps & { children?: ComponentProps<'h1'>['children'] }) => (
  <Box component="h3" sx={{ m: '0 0 6px', fontSize: '15px', fontWeight: 700 }}>
    {children}
  </Box>
)

const SubHeading = ({ children }: ExtraProps & { children?: ComponentProps<'h3'>['children'] }) => (
  <Box component="h4" sx={{ m: '0 0 6px', fontSize: '14.5px', fontWeight: 700 }}>
    {children}
  </Box>
)

// Internal links go through the router: a plain href would reload the page, wiping the conversation
const MarkdownLink = ({ href = '', children }: ComponentProps<'a'> & ExtraProps) => {
  if (/^https?:\/\//.test(href)) return <ExternalLink href={href}>{children}</ExternalLink>
  if (href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link component={RouterLink} to={href} underline="always">
        {children}
      </Link>
    )
  }
  return (
    <Link href={href} underline="always">
      {children}
    </Link>
  )
}

const components: Components = {
  a: MarkdownLink,
  h1: SectionHeading,
  h2: SectionHeading,
  h3: SubHeading,
  h4: SubHeading,
  h5: SubHeading,
  h6: SubHeading,
}

type AssistantMarkdownProps = {
  markdown: string
}

// Not the Markdown component's disallowImages: it blanks every link's href too
const AssistantMarkdown = ({ markdown }: AssistantMarkdownProps) => (
  <Markdown components={components} disallowedElements={['img']}>
    {markdown}
  </Markdown>
)

export default AssistantMarkdown
