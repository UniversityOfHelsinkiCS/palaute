import React from 'react'

import { makeStyles } from '@mui/material'

const useStyles = makeStyles((theme) => ({
  divider: {
    display: 'block',
    height: ({ height }) => theme.spacing(height),
  },
}))

const DividerRow = ({ height = 0.4 }) => {
  const classes = useStyles({ height })

  return <tr className={classes.divider} />
}

export default DividerRow
