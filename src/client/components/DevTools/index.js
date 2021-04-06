import React from 'react'
import { ReactQueryDevtools } from 'react-query/devtools'

import LoginAsDropdown from './LoginAsDropdown'
import BorkButton from './BorkButton'
import { inProduction } from '../../util/common'

const DevTools = () => {
  // eslint-disable-next-line
  if (inProduction) console.log('This is here for testing purposes') // return null

  return (
    <>
      <LoginAsDropdown />
      <BorkButton />
      <ReactQueryDevtools position="bottom-right" />
    </>
  )
}

export default DevTools
