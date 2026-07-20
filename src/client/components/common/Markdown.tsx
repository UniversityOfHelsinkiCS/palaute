import React from 'react'
import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components, ExtraProps } from 'react-markdown'
import { Link, Typography } from '@mui/material'
import type { LinkProps, TypographyProps } from '@mui/material'
import { mergeSx } from '../../util/sx'

const styles = {
  gutterBottom: {
    marginBottom: '0.5rem',
  },
}

const getAcualProps = <T extends ExtraProps>(props: T) => {
  const { node, ...rest } = props
  return rest
}

const GutterTypography = ({ sx, ...props }: TypographyProps & ExtraProps) => (
  <Typography sx={mergeSx(styles.gutterBottom, sx)} {...getAcualProps(props)} fontWeight={400} />
)

const H1 = (props: ComponentProps<'h1'> & ExtraProps) => <GutterTypography variant="h4" component="h1" {...props} />

const H2 = (props: ComponentProps<'h2'> & ExtraProps) => <GutterTypography variant="h5" component="h2" {...props} />

const H3 = (props: ComponentProps<'h3'> & ExtraProps) => <GutterTypography variant="h6" component="h3" {...props} />

const H4 = (props: ComponentProps<'h4'> & ExtraProps) => <GutterTypography variant="body1" component="h4" {...props} />

const A = (props: LinkProps & ExtraProps) => <Link {...getAcualProps(props)} />

const defaultComponents: Components = {
  p: GutterTypography,
  a: A,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
}

type MarkdownProps = ComponentProps<typeof ReactMarkdown> & {
  disallowImages?: boolean
}

const Markdown = ({ disallowImages = false, ...props }: MarkdownProps) => (
  <ReactMarkdown
    components={{ ...defaultComponents }}
    urlTransform={disallowImages ? () => '' : undefined}
    {...props}
  />
)

export default Markdown
