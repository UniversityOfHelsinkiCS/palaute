import React from 'react'
import { makeStyles, Link } from '@material-ui/core'
import ExternalLinkIcon from '@material-ui/icons/OpenInNew'

const useStyles = makeStyles((theme) => ({
  icon: {
    marginLeft: theme.spacing(0.5),
    fontSize: '1em',
  },
}))

const ExternalLink = ({ children, ...props }) => {
  const classes = useStyles()

  return (
    <Link target="_blank" rel="noopener" {...props}>
      {children}
      <ExternalLinkIcon className={classes.icon} />
    </Link>
  )
}

export default ExternalLink
