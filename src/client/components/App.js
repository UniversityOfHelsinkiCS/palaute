import React, { Suspense } from 'react'
import { Switch, Route } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'

import LocalizationProvider from './LocalizationProvider'
import AdUser from './AdUser'
import GuestUser from './GuestUser'
import useTheme from '../theme'
import usePinger from '../hooks/usePinger'
import { inE2EMode } from '../../config'

/* eslint-disable */
const App = () => {
  const theme = useTheme()
  usePinger({ enabled: !inE2EMode })

  return (
    <LocalizationProvider>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Suspense fallback={null}>
            <SnackbarProvider maxSnack={3} preventDuplicate>
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
