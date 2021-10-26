import React, { Suspense } from 'react'
import { Switch, Route } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '@material-ui/core/styles'

import theme from '../theme'
import CssBaseline from './CssBaseline'
import PickerUtilsProvider from './PickerUtilsProvider'
import AdUser from './AdUser'
import GuestUser from './GuestUser'

/* eslint-disable */
const App = () => {
  return (
    <PickerUtilsProvider>
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
    </PickerUtilsProvider>
  )
}
/* eslint-enable */
export default App
