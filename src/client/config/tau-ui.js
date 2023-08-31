import { green, grey, lightBlue } from '@mui/material/colors'

import logo from '../assets/tau_logo.svg'

const images = {
  logo,
}

const styles = {
  logo: {
    link: {
      alignItems: 'center',
      display: 'flex',
    },
    image: {
      height: 'auto',
      width: '192px',
    },
    text: {
      paddingBottom: '0',
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
            dark: '#0e0021',
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
  components: {
    MuiCssBaseline: {
      styleOverrides: `
                body {
                  height: 100vh;
                }
                ::-webkit-scrollbar {
                  width: 10,
                }
                ::-webkit-scrollbar-track {
                  borderRadius: 10,
                }
                ::-webkit-scrollbar-thumb {
                  background: theme.palette.primary.light,
                  borderRadius: 10,
                }
                ::-webkit-scrollbar-thumb:hover {
                  background: theme.palette.info.main,
                }
              `,
    },
    MuiPaper: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        root: {
          borderRadius: '0.8rem',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        root: {
          borderRadius: '0.8rem',
        },
      },
    },
    MuiAccordion: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        rounded: {
          borderRadius: '0.8rem',
        },
      },
    },
    MuiAlert: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        standardInfo: {
          boxShadow: `0 2px 8px 0 ${lightBlue[100]}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          color: 'white',
          background: 'rgb(78,0,142)',
          boxShadow: '0 4px 14px 0 rgb(0 118 255 / 39%)',
          '&:hover': {
            background: 'rgb(92,0,168)',
            boxShadow: '0 4px 14px 0 rgb(0 118 255 / 44%)',
          },
        },
      },
    },
  },
})

export default { images, styles, theme }
