import type { ComponentProps } from 'react'
import type { Components, ExtraProps } from 'react-markdown'

import { Box } from '@mui/material'

import Markdown from '../common/Markdown'
import MarkdownLink from '../common/MarkdownLink'

// The panel's title is an h2, so answer headings start at h3
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

const components: Components = {
  a: MarkdownLink,
  h1: SectionHeading,
  h2: SectionHeading,
  h3: SubHeading,
  h4: SubHeading,
  h5: SubHeading,
  h6: SubHeading,
}

type AnswerMarkdownProps = {
  markdown: string
}

// Not the Markdown component's disallowImages: it blanks every link's href too
const AnswerMarkdown = ({ markdown }: AnswerMarkdownProps) => (
  <Markdown components={components} disallowedElements={['img']}>
    {markdown}
  </Markdown>
)

export default AnswerMarkdown
