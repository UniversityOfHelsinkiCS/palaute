import React from 'react'
import LoginAsDropdown from './LoginAsDropdown'
import BorkButton from './BorkButton'
import { inProduction } from '../../util/common'

const DevTools = () => {
  if (inProduction) console.log('This is here for testing purposes') // return null

  return (
    <>
      <LoginAsDropdown />
      <BorkButton />
    </>
  )
}

export default DevTools
