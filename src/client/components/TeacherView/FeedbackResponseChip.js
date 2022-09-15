import React from 'react'
import { css, keyframes } from '@mui/material'
import { useTranslation } from 'react-i18next'
import LinkChip from '../LinkChip'

const common = {
  '&:hover': {
    borderRadius: '3px',
  },
  transition: (theme) =>
    theme.transitions.create(['border-radius'], {
      easing: 'ease-out',
      duration: '0.2s',
    }),
  cursor: 'pointer',
}

const pulse = keyframes`
  0%, 88% { 
    transform: scaleX(1.0);
  }
  100% { 
    transform: scaleX(1.05) translateY(-2px);
}
`

const flow = keyframes`
  0% { 
    background-position: -100px 0;
  }
  100% {
    background-position: 100px 0;
  }
`

const styles = {
  sent: {
    borderColor: (theme) => theme.palette.success.main,
    color: (theme) => theme.palette.success.main,
    ...common,
  },
  notGiven: {
    borderColor: (theme) => theme.palette.error.light,
    color: (theme) => theme.palette.error.light,
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
  shimmer: {
    background: (theme) => theme.palette.primary,
    backgroundImage:
      'linear-gradient(to right, #edf7ff 0%, #d2e7fc 10%, #edf7ff 20%)',
    backgroundSize: '300px, 20px',
    animation: css`
      ${flow} 6.5s infinite forwards linear
    `,
    color: '#09233d',
    borderColor: '#a3bed9',
    ...common,
  },
}

const FeedbackResponseChip = ({
  id,
  feedbackResponseGiven,
  feedbackResponseSent,
  ongoing,
  ...props
}) => {
  const { t } = useTranslation()

  const notSentLabel = feedbackResponseGiven
    ? t('teacherView:feedbackResponseNotSent')
    : t('teacherView:feedbackResponseMissing')

  const label = feedbackResponseSent
    ? t('teacherView:feedbackResponseGiven')
    : notSentLabel

  const ongoingLabel = t('teacherView:feedbackOpen')

  const ongoingStyle = styles.shimmer

  const notSentStyle = feedbackResponseGiven ? styles.notSent : styles.notGiven

  const url =
    feedbackResponseSent || ongoing
      ? `/targets/${id}/results`
      : `/targets/${id}/edit-feedback-response`

  const sx = feedbackResponseSent ? styles.sent : notSentStyle

  return (
    <LinkChip
      to={url}
      label={ongoing ? ongoingLabel : label}
      sx={ongoing ? ongoingStyle : sx}
      {...props}
    />
  )
}

export default FeedbackResponseChip
