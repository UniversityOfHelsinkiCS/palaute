import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { green, grey, lightBlue } from '@mui/material/colors'
import { useMemo } from 'react'
import { deepmerge } from '@mui/utils'

const defaultTheme = mode => ({
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
            light: '#4f96db',
            main: '#3770b3',
            dark: '#124c8c',
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
            main: '#ffc107',
            light: '#ffcd38',
            extraLight: '#fff3c4',
            dark: '#665216',
          },
          chipSuccess: {
            main: '#2e7d32',
            dark: '#005704',
            light: '#bdffc0',
          },
          chipWarning: {
            main: '#8b7218',
            dark: '#6b3600',
            light: '#fddeaf',
          },
          chipError: {
            main: '#d32f2f',
            dark: '#6b0000',
            light: '#ffb3b3',
          },
          chipOngoing: {
            main: '#006ba8',
            dark: '#09233d',
            light: '#edf7ff',
          },
          chipContinuous: {
            main: '#027902',
            dark: '#003300',
            light: '#ccffcc',
          },
          chipInterim: {
            main: '#621b6f',
            dark: '#300d59',
            light: '#ead8ee',
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
          background: 'rgb(8 110 221)',
          boxShadow: '0 4px 14px 0 rgb(0 118 255 / 39%)',
          '&:hover': {
            background: 'rgba(10,130,235,1)',
            boxShadow: '0 4px 14px 0 rgb(0 118 255 / 44%)',
          },
        },
      },
    },
  },
})

const useTheme = customTheme => {
  const prefersDarkMode = false // useMediaQuery('(prefers-color-scheme: dark)')
  const mode = prefersDarkMode ? 'dark' : 'light'
  const baseTheme = createTheme(defaultTheme(mode))

  return useMemo(
    () =>
      customTheme
        ? responsiveFontSizes(deepmerge(baseTheme, createTheme(customTheme(mode))))
        : responsiveFontSizes(baseTheme),
    [mode, customTheme]
  )
}
export default useTheme
