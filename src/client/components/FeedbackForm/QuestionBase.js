import React from 'react'

import { Typography, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  label: {
    marginBottom: theme.spacing(1),
    display: 'block',
  },
  description: {
    marginBottom: theme.spacing(1),
  },
}))

const QuestionBase = ({
  children,
  label,
  description,
  required,
  labelProps = {},
}) => {
  const classes = useStyles()

  return (
    <>
      <Typography variant="h6" className={classes.label} {...labelProps}>
        {label}
        {required && ' *'}
      </Typography>
      {description && (
        <Typography className={classes.description}>{description}</Typography>
      )}
      {children}
    </>
  )
}

export default QuestionBase
