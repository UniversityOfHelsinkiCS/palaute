import React from 'react'
import { Chip, makeStyles } from '@material-ui/core'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  sent: {
    borderColor: theme.palette.success.dark,
    color: theme.palette.success.dark,
  },
  notGiven: {
    borderColor: theme.palette.error.light,
    color: theme.palette.error.main,
  },
  notSent: {
    borderColor: theme.palette.warning.dark,
    color: theme.palette.warning.dark,
  },
}))

const FeedbackResponseChip = ({
  feedbackResponseGiven,
  feedbackResponseSent,
  className,
  ...props
}) => {
  const classes = useStyles()
  const { t } = useTranslation()

  const notSentLabel = feedbackResponseGiven
    ? t('teacherView:feedbackResponseNotSent')
    : t('teacherView:feedbackResponseMissing')

  const label = feedbackResponseSent
    ? t('teacherView:feedbackResponseGiven')
    : notSentLabel

  const notSentClassName = feedbackResponseGiven
    ? classes.notSent
    : classes.notGiven

  const classNames = cn(
    className,
    feedbackResponseSent ? classes.sent : notSentClassName,
  )

  return (
    <Chip
      label={label}
      className={classNames}
      variant="outlined"
      size="small"
      {...props}
    />
  )
}

export default FeedbackResponseChip
