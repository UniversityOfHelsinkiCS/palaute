import React from 'react'
import { Alert, keyframes } from '@mui/material'

import SeasonalEmoji from '../../../../components/common/SeasonalEmoji'

const tada = keyframes({
  from: {
    transform: 'scale3d(1, 1, 1)',
  },

  '10%, 20%': {
    transform: 'scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -6deg)',
  },

  '30%, 50%, 70%, 90%': {
    transform: 'scale3d(1.2, 1.2, 1.2) rotate3d(0, 0, 1, 6deg)',
  },

  '40%, 60%, 80%': {
    transform: 'scale3d(1.2, 1.2, 1.2) rotate3d(0, 0, 1, -6deg)',
  },
  to: {
    transform: 'scale3d(1, 1, 1)',
  },
})

const styles = {
  alert: {
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  icon: {
    animation: `${tada} 2500ms`,
    animationDelay: '500ms',
  },
}

interface FeedbackGivenSnackbarProps {
  id: string | number
  children: React.ReactNode
}

const FeedbackGivenSnackbar = React.forwardRef<HTMLDivElement, React.PropsWithChildren<FeedbackGivenSnackbarProps>>(
  ({ id, children, ...props }: FeedbackGivenSnackbarProps, ref) => (
    <Alert
      id={String(id)}
      variant="filled"
      severity="success"
      sx={styles.alert}
      ref={ref}
      elevation={6}
      icon={
        <span style={styles.icon}>
          <SeasonalEmoji />
        </span>
      }
      {...props}
    >
      {children}
    </Alert>
  )
)

const feedbackGivenSnackbarContent = (key: string | number, message: string) => (
  <FeedbackGivenSnackbar id={key}>{message}</FeedbackGivenSnackbar>
)

export default feedbackGivenSnackbarContent
