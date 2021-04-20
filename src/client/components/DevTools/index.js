import React from 'react'
import { ReactQueryDevtools } from 'react-query/devtools'

import { inProduction } from '../../util/common'

const DevTools = () => {
  if (inProduction) return null

  return (
    <>
      <ReactQueryDevtools position="bottom-right" />
    </>
  )
}

export default DevTools
