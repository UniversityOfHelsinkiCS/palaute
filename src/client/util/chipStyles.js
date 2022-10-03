import { css, keyframes } from '@mui/material'

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
    background-position: 200px 0;
  }
`

const styles = {
  interactive: {
    ...common,
  },
  success: {
    borderColor: (theme) => theme.palette.success.main,
    color: (theme) => theme.palette.success.main,
  },
  error: {
    borderColor: (theme) => theme.palette.error.light,
    color: (theme) => theme.palette.error.light,
    animation: css`
      ${pulse} 2s 1s alternate infinite
    `,
  },
  warning: {
    borderColor: (theme) => theme.palette.warning.dark,
    color: (theme) => theme.palette.warning.dark,
    animation: css`
      ${pulse} 2.2s 0s alternate infinite
    `,
  },
  shimmering: {
    background: (theme) => theme.palette.primary,
    backgroundImage:
      'linear-gradient(55deg, #edf7ff 10%, #d2e7fc 30%, #edf7ff 50%)',
    backgroundSize: '150px, 20px',
    animation: css`
      ${flow} 6.5s infinite forwards linear
    `,
    color: '#09233d',
    borderColor: '#a3bed9',
  },
}

export default styles
