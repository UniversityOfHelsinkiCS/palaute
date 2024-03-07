import React, { useEffect, useState } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'

const useCourseUnitGridColumns = theme => {
  const [columns, setColumns] = useState(0)

  const lg = useMediaQuery(theme.breakpoints.up('lg'))
  const md = useMediaQuery(theme.breakpoints.between('md', 'lg'))
  const sm = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    if (lg) {
      setColumns(3)
    } else if (md) {
      setColumns(2)
    } else if (sm) {
      setColumns(1)
    }
  }, [lg, md, sm])

  return columns
}

export default useCourseUnitGridColumns
