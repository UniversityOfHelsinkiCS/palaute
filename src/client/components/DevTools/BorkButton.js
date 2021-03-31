import React from 'react'
import { Button } from '@material-ui/core'
import { inProduction } from '../../util/common'

const BorkButton = () => {
  // eslint-disable-next-line
  if (inProduction) console.log('This is here for testing purposes') // return null

  const borkBork = undefined
  return (
    <Button variant="contained" color="secondary" onClick={() => borkBork()()}>
      {' '}
      Break the application{' '}
    </Button>
  )
}

export default BorkButton
