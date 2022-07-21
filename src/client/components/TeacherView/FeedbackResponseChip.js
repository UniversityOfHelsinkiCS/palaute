import React from 'react'
import { Chip, css, keyframes } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'

const common = {
  '&:hover': {
    borderRadius: '4px',
  },
  transition: (theme) =>
    theme.transitions.create(['border-radius'], {
      easing: 'ease-out',
      duration: '0.2s',
    }),
}

const pulse = keyframes`
  0%, 88% { 
    transform: scaleX(1.0);
  }
  100% { 
    transform: scaleX(1.05) translateY(-2px);
}
`

const styles = {
  sent: {
    borderColor: (theme) => theme.palette.success.dark,
    color: (theme) => theme.palette.success.dark,
    ...common,
  },
  notGiven: {
    borderColor: (theme) => theme.palette.error.light,
    color: (theme) => theme.palette.error.main,
    animation: css`
      ${pulse} 2s 1s alternate infinite
    `,
    ...common,
  },
  notSent: {
    borderColor: (theme) => theme.palette.warning.dark,
    color: (theme) => theme.palette.warning.dark,
    animation: css`
      ${pulse} 2.2s 0s alternate infinite
    `,
    ...common,
  },
}

const FeedbackResponseChip = ({
  id,
  feedbackResponseGiven,
  feedbackResponseSent,
  sx,
  ...props
}) => {
  const history = useHistory()
  const { t } = useTranslation()

  const notSentLabel = feedbackResponseGiven
    ? t('teacherView:feedbackResponseNotSent')
    : t('teacherView:feedbackResponseMissing')

  const label = feedbackResponseSent
    ? t('teacherView:feedbackResponseGiven')
    : notSentLabel

  const notSentStyle = feedbackResponseGiven ? styles.notSent : styles.notGiven

  const handleClick = () => {
    const url = feedbackResponseSent
      ? `/targets/${id}/results`
      : `/targets/${id}/edit-feedback-response`

    history.push(url)
  }

  const finalSx = [sx, feedbackResponseSent ? styles.sent : notSentStyle]

  return (
    <Chip
      onClick={id ? handleClick : undefined}
      label={label}
      sx={finalSx}
      variant="outlined"
      size="small"
      {...props}
    />
  )
}

export default FeedbackResponseChip
