import React from 'react'
import { CssBaseline as MuiCssBaseline, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  '@global': {
    body: {
      ...theme.typography.body1,
    },
  },
}))

const CssBaseline = () => {
  useStyles()

  return <MuiCssBaseline />
}

export default CssBaseline
