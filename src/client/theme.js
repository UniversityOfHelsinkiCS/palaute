import { useMediaQuery } from '@mui/material'
import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { lightBlue, green, grey } from '@mui/material/colors'
import { useMemo } from 'react'

import { inStaging } from '../config'

const useTheme = () => {
  const prefersDarkMode = false // useMediaQuery('(prefers-color-scheme: dark)')
  const mode = prefersDarkMode ? 'dark' : 'light'

  const theme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme({
          palette: {
            mode,
            ...(mode === 'light'
              ? {
                  primary: {
                    light: '#4f96db',
                    main: !inStaging ? '#3770b3' : '#77dcbb',
                    dark: '#14549c', // Ukraine blue
                  },
                  secondary: {
                    main: '#e6c309', // Ukraine yellow
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
                    light: '#ffd700', // Ukraine yellow
                  },
                }
              : {}),
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
            },
            MuiCard: {
              defaultProps: {
                elevation: 2,
              },
            },
            MuiAccordion: {
              defaultProps: {
                elevation: 2,
              },
            },
            MuiAlert: {
              defaultProps: {
                elevation: 0,
              },
            },
          },
        }),
      ),
    [mode],
  )

  return theme
}

export default useTheme
