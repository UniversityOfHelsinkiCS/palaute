import { green, grey, lightBlue } from '@mui/material/colors'

import logo from '../assets/hy_logo.svg'

const images = {
  logo,
}

const styles = {
  logo: {
    link: {
      alignItems: 'center',
      display: 'flex',
    },
  },
}

const theme = mode => ({
  typography: {
    fontFamily: [
      '"Open Sans"',
      '"Helvetica"',
      '"Arial"',
      '"sans-serif"',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 700,
    fontWeightBold: 800,
  },
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#4e008e',
            light: '#5c00a8',
            dark: '#4e008e',
          },
          secondary: {
            main: '#e6c309',
          },
          info: {
            main: lightBlue[700],
            light: lightBlue[500],
            dark: lightBlue[900],
          },
          success: {
            main: green[800],
            light: green[500],
            dark: green[900],
          },
          background: {
            default: grey[50],
          },
          warning: {
            main: '#e6c309',
            light: '#ffd700',
          },
        }
      : {}),
  },
  shape: {
    borderRadius: 6,
  },
})

export default { images, styles, theme }
