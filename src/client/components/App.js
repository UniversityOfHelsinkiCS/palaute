import React, { useEffect } from 'react'
import { initShibbolethPinger } from 'unfuck-spa-shibboleth-session'
import NavBar from './NavBar'
import Footer from './Footer'
import DevTools from './DevTools'
import Router from './Router'

export default () => {
  useEffect(() => {
    initShibbolethPinger() // Remove this if not used behind shibboleth
  }, [])

  return (
    <div>
      <NavBar />
      <Router />
      <DevTools />
      <Footer />
    </div>
  )
}
