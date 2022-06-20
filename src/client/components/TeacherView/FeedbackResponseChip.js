import React from 'react'
import { Chip, makeStyles } from '@material-ui/core'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'

const useStyles = makeStyles((theme) => {
  const common = {
    '&:hover': {
      borderRadius: '4px',
    },
    transition: theme.transitions.create(['border-radius'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shortest,
    }),
  }
  return {
    '@keyframes pulse': {
      '0%, 88%': { transform: 'scaleX(1.0)' },
      '100%': { transform: 'scaleX(1.05) translateY(-2px)' },
    },
    sent: {
      borderColor: theme.palette.success.dark,
      color: theme.palette.success.dark,
      ...common,
    },
    notGiven: {
      borderColor: theme.palette.error.light,
      color: theme.palette.error.main,
      animation: `$pulse 2s 1s alternate infinite`,
      ...common,
    },
    notSent: {
      borderColor: theme.palette.warning.dark,
      color: theme.palette.warning.dark,
      animation: `$pulse 2.2s 0s alternate infinite`,
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
  const classes = useStyles({ id })
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
