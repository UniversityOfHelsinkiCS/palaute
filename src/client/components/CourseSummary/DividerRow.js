import React from 'react'

import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  divider: {
    display: 'block',
    height: theme.spacing(1),
  },
}))

const DividerRow = () => {
  const classes = useStyles()

  return <tr className={classes.divider} />
}

export default DividerRow
