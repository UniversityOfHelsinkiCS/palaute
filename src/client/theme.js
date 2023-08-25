import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { green, grey, lightBlue } from '@mui/material/colors'
import { useEffect, useMemo, useState } from 'react'
import { deepmerge } from '@mui/utils'

import { CUSTOM_THEME_NAMESPACE } from './util/common'

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

const useTheme = () => {
  const [customTheme, setCustomTheme] = useState()

  useEffect(() => {
    if (CUSTOM_THEME_NAMESPACE) {
      import(`./themes/${CUSTOM_THEME_NAMESPACE}`).then(customTheme => setCustomTheme(customTheme))
    }
  }, [CUSTOM_THEME_NAMESPACE])

  const prefersDarkMode = false // useMediaQuery('(prefers-color-scheme: dark)')
  const mode = prefersDarkMode ? 'dark' : 'light'
  const baseTheme = createTheme(defaultTheme(mode))

  return useMemo(
    () =>
      customTheme
        ? responsiveFontSizes(deepmerge(baseTheme, createTheme(customTheme.default(mode))))
        : responsiveFontSizes(baseTheme),
    [mode, customTheme]
  )
}
export default useTheme
