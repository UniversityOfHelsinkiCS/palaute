import React, { Suspense } from 'react'
import { Switch, Route } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'

import LocalizationProvider from '../components/LocalizationProvider'
import AdUser from './AdUser'
import GuestUser from './GuestUser'
import useTheme from '../theme'
import usePinger from '../hooks/usePinger'
import { inE2EMode, CUSTOM_THEME_NAMESPACE } from '../util/common'

/* eslint-disable */
const App = () => {
  const theme = useTheme(CUSTOM_THEME_NAMESPACE || undefined)

  usePinger({ enabled: !inE2EMode })

  return (
    <LocalizationProvider>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Suspense fallback={null}>
            <SnackbarProvider maxSnack={3} preventDuplicate autoHideDuration={10_000}>
              <Switch>
                <Route path="/noad">
                  <GuestUser />
                </Route>
                <Route>
                  <AdUser />
                </Route>
              </Switch>
            </SnackbarProvider>
          </Suspense>
        </ThemeProvider>
      </StyledEngineProvider>
    </LocalizationProvider>
  )
}
/* eslint-enable */
export default App
