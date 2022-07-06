import { useMediaQuery } from '@mui/material'
import {
  createTheme,
  responsiveFontSizes,
  adaptV4Theme,
} from '@mui/material/styles'
import { lightBlue, green } from '@mui/material/colors'
import { useMemo } from 'react'

import { inStaging } from '../config'

const useTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme(
          adaptV4Theme({
            palette: {
              primary: {
                main: !inStaging ? '#1077A1' : '#77dcbb',
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
            },
          }),
        ),
      ),
    [prefersDarkMode],
  )

  return theme
}

export default useTheme
