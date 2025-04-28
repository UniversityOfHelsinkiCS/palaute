import React from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { inProduction } from '../../util/common'
import AdminLoggedInAsBanner from './AdminLoggedInAsBanner'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { SuperSpeedLoginAs } from './SuperSpeedLoginAs'
import { useLoggedInAs } from './useLoggedInAs'

const DevTools = () => {
  const { authorizedUser } = useAuthorizedUser()
  const { isLoggedInAs, exitLoggedInAs } = useLoggedInAs()

  return (
    <>
      {!inProduction && <ReactQueryDevtools />}
      <AdminLoggedInAsBanner isLoggedInAs={isLoggedInAs} exitLoggedInAs={exitLoggedInAs} />
      {(authorizedUser?.isAdmin || isLoggedInAs) && <SuperSpeedLoginAs />}
    </>
  )
}

export default DevTools
