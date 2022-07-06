import React from 'react'
import { makeStyles, Link } from '@mui/material'
import ExternalLinkIcon from '@mui/icons-material/OpenInNew'

const useStyles = makeStyles((theme) => ({
  icon: {
    marginLeft: theme.spacing(0.5),
    fontSize: '1em',
  },
}))

const ExternalLink = ({ children, ...props }) => {
  const classes = useStyles()

  return (
    <Link target="_blank" rel="noopener" {...props} underline="hover">
      {children}
      <ExternalLinkIcon className={classes.icon} />
    </Link>
  )
}

export default ExternalLink
