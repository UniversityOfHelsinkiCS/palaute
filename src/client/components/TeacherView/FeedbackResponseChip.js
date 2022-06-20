import React from 'react'
import { Chip, makeStyles } from '@material-ui/core'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'

const useStyles = makeStyles((theme) => {
  const common = {
    '&:hover': {
      transform: 'scaleX(1.04)',
    },
    transition: theme.transitions.create(['transform'], {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeOut,
    }),
  }

  return {
    sent: {
      borderColor: theme.palette.success.dark,
      color: theme.palette.success.dark,
      ...common,
    },
    notGiven: {
      borderColor: theme.palette.error.light,
      color: theme.palette.error.main,
      ...common,
    },
    notSent: {
      borderColor: theme.palette.warning.dark,
      color: theme.palette.warning.dark,
      ...common,
    },
  }
})

const FeedbackResponseChip = ({
  id,
  feedbackResponseGiven,
  feedbackResponseSent,
  className,
  ...props
}) => {
  const classes = useStyles()
  const history = useHistory()
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

  const handleClick = () => {
    const url = feedbackResponseSent
      ? `/targets/${id}/results`
      : `/targets/${id}/edit-feedback-response`

    history.push(url)
  }

  const classNames = cn(
    className,
    feedbackResponseSent ? classes.sent : notSentClassName,
  )

  return (
    <Chip
      onClick={id ? handleClick : undefined}
      label={label}
      className={classNames}
      variant="outlined"
      size="small"
      {...props}
    />
  )
}

export default FeedbackResponseChip
