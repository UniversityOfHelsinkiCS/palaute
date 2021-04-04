import React, { useEffect } from 'react'
import * as Sentry from '@sentry/browser'
import { initShibbolethPinger } from 'unfuck-spa-shibboleth-session'
import NavBar from './NavBar'
import Footer from './Footer'
import DevTools from './DevTools'
import Router from './Router'
import { useUserData } from '../util/queries'

export default () => {
  useEffect(() => {
    initShibbolethPinger() // Remove this if not used behind shibboleth
  }, [])

  const user = useUserData()

  if (user.isLoading) return null

  Sentry.setUser({ username: user.data.id })

  return (
    <div>
      <NavBar />
      <Router />
      <DevTools />
      <Footer />
    </div>
  )
}
