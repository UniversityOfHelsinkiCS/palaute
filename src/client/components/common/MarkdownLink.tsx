import type { ComponentProps } from 'react'
import type { ExtraProps } from 'react-markdown'

import { Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import ExternalLink from './ExternalLink'

// Links within Norppa go through the router: a plain href would reload the page, wiping e.g. the help chatbot's
// conversation, and a plain #section link would look like going back to the router. Other sites open in a new tab.
const MarkdownLink = ({ href = '', children }: ComponentProps<'a'> & ExtraProps) => {
  if (/^https?:\/\//.test(href)) return <ExternalLink href={href}>{children}</ExternalLink>
  if ((href.startsWith('/') && !href.startsWith('//')) || href.startsWith('#')) {
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

export default MarkdownLink
