import React from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { inProduction } from '../../util/common'
import AdminLoggedInAsBanner from './AdminLoggedInAsBanner'

const DevTools = () => (
  <>
    {!inProduction && <ReactQueryDevtools />}
    <AdminLoggedInAsBanner />
  </>
)

export default DevTools
