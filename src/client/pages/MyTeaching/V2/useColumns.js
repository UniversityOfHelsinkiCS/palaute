import React, { useEffect, useState } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'

const useColumns = theme => {
  const [columns, setColumns] = useState(0)

  const md = useMediaQuery(theme.breakpoints.up('md'))
  const sm = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const xs = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    if (md) {
      setColumns(3)
    } else if (sm) {
      setColumns(2)
    } else if (xs) {
      setColumns(1)
    }
  }, [md, sm, xs])

  return columns
}

export default useColumns
