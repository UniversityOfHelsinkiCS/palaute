import React from 'react'
import cn from 'classnames'
import { Link } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
  alertLink: {
    fontWeight: theme.typography.fontWeightMedium,
    textDecoration: 'underline',
  },
}))

const AlertLink = ({ className, ...props }) => {
  const classes = useStyles()

  return (
    <Link
      color="inherit"
      className={cn(className, classes.alertLink)}
      {...props}
      underline="hover"
    />
  )
}

export default AlertLink
