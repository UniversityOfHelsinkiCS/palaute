import React from 'react'
import cn from 'classnames'
import { Link, makeStyles } from '@material-ui/core'

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
    />
  )
}

export default AlertLink
