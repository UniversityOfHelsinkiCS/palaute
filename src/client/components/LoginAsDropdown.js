import React from 'react'
import { Autocomplete } from '@material-ui/lab'
import { TextField } from '@material-ui/core'
import { inProduction } from '../util/common'

import {
  possibleUsers,
  setHeaders,
  getHeaders,
  clearHeaders,
} from '../util/mockHeaders'

const LogInAsDropdown = () => {
  if (inProduction) return null

  const loggedInAs = getHeaders()

  const clearStorage = () => {
    clearHeaders()
    window.location.reload()
  }

  const setStorage = (uid) => {
    setHeaders(uid)
    window.location.reload()
  }

  return (
    <Autocomplete
      value={loggedInAs.uid ? loggedInAs : null}
      id="combo-box-demo"
      onChange={(_, newValue) => {
        if (!newValue) return clearStorage()
        return setStorage(newValue.uid)
      }}
      options={possibleUsers}
      getOptionLabel={(option) => option.uid || ''}
      getOptionSelected={(option) => option.uid === loggedInAs.uid}
      style={{ width: 300 }}
      renderInput={(params) => (
        <TextField {...params} label="Login As User" variant="outlined" /> // eslint-disable-line
      )}
    />
  )
}

export default LogInAsDropdown
