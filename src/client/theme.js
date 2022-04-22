import { useMediaQuery } from '@material-ui/core'
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'
import { useMemo } from 'react'

import { inStaging } from '../config'

const useTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  if (prefersDarkMode) console.log('Dark MODE!')
  const theme = useMemo(
    () =>
      responsiveFontSizes(
        createMuiTheme({
          palette: {
            // type: prefersDarkMode ? 'dark' : 'light',
            primary: {
              main: !inStaging ? '#1077A1' : '#77dcbb',
            },
          },
        }),
      ),
    [prefersDarkMode],
  )

  return theme
}

export default useTheme
