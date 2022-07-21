import React from 'react'
import { Chip, css, keyframes } from '@mui/material'
import { useTranslation } from 'react-i18next'

const flow = keyframes`
  0% { 
    background-position: -100px 0;
  }
  100% {
    background-position: 100px 0;
  }
`

const styles = {
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
  },
}

const FeedbackOpenChip = () => {
  const { t } = useTranslation()

  return (
    <Chip
      label={t('teacherView:feedbackOpen')}
      variant="outlined"
      size="small"
      sx={styles.shimmer}
    />
  )
}

export default FeedbackOpenChip
