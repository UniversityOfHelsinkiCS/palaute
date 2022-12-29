import React from 'react'
import { ReactQueryDevtools } from 'react-query/devtools'

import { inProduction } from '../../util/common'
import AdminLoggedInAsBanner from './AdminLoggedInAsBanner'

const DevTools = () => {
  if (inProduction) return null

  return (
    <>
      <ReactQueryDevtools position="bottom-right" />
      <AdminLoggedInAsBanner />
    </>
  )
}

export default DevTools
