import React from 'react'
import { ReactQueryDevtools } from 'react-query/devtools'

import { inProduction } from '../../util/common'
import AdminLoggedInAsBanner from './AdminLoggedInAsBanner'

const DevTools = () => (
  <>
    {!inProduction && <ReactQueryDevtools position="bottom-right" />}
    <AdminLoggedInAsBanner />
  </>
)

export default DevTools
