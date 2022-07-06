import React from 'react'
import ReactMarkdown from 'react-markdown'
import cn from 'classnames'
import { Link, Typography, makeStyles } from '@mui/material'

const useStyles = makeStyles((theme) => ({
  gutterBottom: {
    marginBottom: theme.spacing(2),
  },
}))

const GutterTypography = ({ className, ...props }) => {
  const classes = useStyles()

  return (
    <Typography className={cn(className, classes.gutterBottom)} {...props} />
  )
}

const H1 = (props) => (
  <GutterTypography variant="h3" component="h1" {...props} />
)

const H2 = (props) => (
  <GutterTypography variant="h4" component="h2" {...props} />
)

const H3 = (props) => (
  <GutterTypography variant="h5" component="h3" {...props} />
)

const H4 = (props) => (
  <GutterTypography variant="h6" component="h4" {...props} />
)

const defaultComponents = {
  p: GutterTypography,
  a: Link,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
}

const Markdown = ({ components = {}, ...props }) => (
  <ReactMarkdown
    components={{ ...defaultComponents, ...components }}
    linkTarget="_blank"
    {...props}
  />
)

export default Markdown
