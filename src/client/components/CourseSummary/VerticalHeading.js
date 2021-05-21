import React from 'react'

import { Tooltip, Typography, makeStyles } from '@material-ui/core'
import cn from 'classnames'

const useStyles = makeStyles((theme) => ({
  heading: {
    padding: theme.spacing(2),
    '& > span': {
      writingMode: 'vertical-rl',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxHeight: '250px',
      fontWeight: theme.typography.fontWeightBold,
    },
  },
}))

const VerticalHeading = ({
  children,
  className,
  component: Component = 'th',
  ...props
}) => {
  const classes = useStyles()

  return (
    <Tooltip title={children}>
      <Component className={cn(classes.heading, className)} {...props}>
        <Typography component="span">{children}</Typography>
      </Component>
    </Tooltip>
  )
}

export default VerticalHeading
