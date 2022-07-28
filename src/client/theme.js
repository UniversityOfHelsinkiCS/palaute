import { useMediaQuery } from '@mui/material'
import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { lightBlue, green, red, grey } from '@mui/material/colors'
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
                    main: !inStaging ? '#1077A1' : '#77dcbb',
                  },
                  secondary: red,
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
              display: none;
            }
          `,
            },
          },
        }),
      ),
    [mode],
  )

  return theme
}

export default useTheme
