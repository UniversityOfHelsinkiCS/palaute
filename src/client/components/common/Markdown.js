import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, Typography } from '@mui/material'

const styles = {
  gutterBottom: {
    marginBottom: '0.5rem',
  },
}

const GutterTypography = ({ sx, ...props }) => <Typography sx={[sx, styles.gutterBottom]} {...props} fontWeight={400} />

const H1 = props => <GutterTypography variant="h4" component="h1" {...props} />

const H2 = props => <GutterTypography variant="h5" component="h2" {...props} />

const H3 = props => <GutterTypography variant="h6" component="h3" {...props} />

const H4 = props => <GutterTypography variant="body1" component="h4" {...props} />

const A = props => <Link color="inherit" {...props} />

const defaultComponents = {
  p: GutterTypography,
  a: A,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
}

const Markdown = ({ disallowImages = false, ...props }) => (
  <ReactMarkdown
    components={{ ...defaultComponents }}
    linkTarget="_blank"
    transformImageUri={disallowImages ? () => '' : null}
    {...props}
  />
)

export default Markdown
