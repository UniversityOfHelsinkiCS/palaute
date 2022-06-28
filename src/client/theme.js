import { useMediaQuery } from '@material-ui/core'
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'
import { useMemo } from 'react'

import { inStaging } from '../config'
import useGlobalStyles from './globalStyles'

const useTheme = () => {
  useGlobalStyles()
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () =>
      responsiveFontSizes(
        createMuiTheme({
          palette: {
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
