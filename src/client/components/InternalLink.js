import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles, Typography } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  link: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
    marginTop: '8px',
  },
}))

const InternalLink = ({ children, href, ...props }) => {
  const classes = useStyles()
  return (
    <Link to={href} {...props} className={classes.link}>
      <Typography variant="body1" color="primary">
        {children}
      </Typography>
    </Link>
  )
}

export default InternalLink
