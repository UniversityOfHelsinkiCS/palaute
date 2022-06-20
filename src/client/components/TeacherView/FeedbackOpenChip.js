import React from 'react'
import { Chip, makeStyles } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  '@keyframes flow': {
    '0%': { 'background-position': '-100px 0' },
    '100%': { 'background-position': '100px 0' },
  },
  shimmer: {
    background: theme.palette.primary,
    backgroundImage:
      'linear-gradient(to right, #edf7ff 0%, #d2e7fc 10%, #edf7ff 20%)',
    backgroundSize: '300px, 20px',
    animationName: '$flow',
    animationDuration: '6.5s',
    animationIterationCount: 'infinite',
    animationFillMode: 'forwards',
    animationTimingFunction: 'linear',
    color: '#09233d',
    borderColor: '#a3bed9',
  },
}))

const FeedbackOpenChip = () => {
  const { t } = useTranslation()
  const classes = useStyles()

  return (
    <Chip
      label={t('teacherView:feedbackOpen')}
      variant="outlined"
      size="small"
      className={classes.shimmer}
    />
  )
}

export default FeedbackOpenChip
