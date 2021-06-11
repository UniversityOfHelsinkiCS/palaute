import React from 'react'
import { Chip, makeStyles } from '@material-ui/core'
import cn from 'classnames'

const useStyles = makeStyles((theme) => ({
  given: {
    borderColor: theme.palette.success.light,
    color: theme.palette.success.main,
  },
  notGiven: {
    borderColor: theme.palette.error.light,
    color: theme.palette.error.main,
  },
}))

const FeedbackResponseChip = ({ feedbackResponseGiven, className }) => {
  const classes = useStyles()

  const label = feedbackResponseGiven
    ? 'Vastapalaute annettu'
    : 'Vastapalaute puuttuu'

  const classNames = cn(
    className,
    feedbackResponseGiven ? classes.given : classes.notGiven,
  )

  return (
    <Chip
      label={label}
      className={classNames}
      color="success"
      variant="outlined"
      size="small"
    />
  )
}

export default FeedbackResponseChip
