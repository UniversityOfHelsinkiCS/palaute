import { css, keyframes } from '@mui/material'

const common = {
  '&:hover': {
    borderRadius: '3px',
  },
  transition: theme =>
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
    background-position: 200px 0;
  }
`

const styles = {
  interactive: {
    ...common,
  },
  success: {
    borderColor: theme => theme.palette.chipSuccess.main,
    color: theme => theme.palette.chipSuccess.main,
  },
  error: {
    borderColor: theme => theme.palette.chipError.main,
    color: theme => theme.palette.chipError.main,
    animation: css`
      ${pulse} 2s 1s alternate infinite
    `,
  },
  warning: {
    borderColor: theme => theme.palette.chipWarning.main,
    color: theme => theme.palette.chipWarning.main,
    animation: css`
      ${pulse} 2.2s 0s alternate infinite
    `,
  },
  shimmering: {
    background: theme => theme.palette.primary,
    backgroundImage: 'linear-gradient(55deg, #edf7ff 10%, #d2e7fc 30%, #edf7ff 50%)',
    backgroundSize: '150px, 20px',
    animation: css`
      ${flow} 6.5s infinite forwards linear
    `,
    color: theme => theme.palette.chipOngoing.dark,
    borderColor: theme => theme.palette.chipOngoing.main,
  },
  shimmeringSecondary: {
    background: theme => theme.palette.primary,
    backgroundImage: 'linear-gradient(55deg, #ccffcc 10%, #99ff99 30%, #ccffcc 50%)',
    backgroundSize: '150px, 20px',
    animation: css`
      ${flow} 6.5s infinite forwards linear
    `,
    color: theme => theme.palette.chipContinuous.dark,
    borderColor: theme => theme.palette.chipContinuous.main,
  },
  interim: {
    background: theme => theme.palette.primary,
    backgroundImage: 'linear-gradient(55deg, #ead8ee 10%, #d4b4d9 30%, #ead8ee 50%)',
    backgroundSize: '150px, 20px',
    animation: css`
      ${flow} 6.5s infinite forwards linear
    `,
    color: theme => theme.palette.chipInterim.dark,
    borderColor: theme => theme.palette.chipInterim.main,
  },
}

export default styles
