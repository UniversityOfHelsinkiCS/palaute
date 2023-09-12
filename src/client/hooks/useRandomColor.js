import React from 'react'
import { generate } from '../util/randomColor'

/* eslint-disable no-bitwise */

const hash = s =>
  Math.abs(
    s.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
  )

const useRandomColor = (key, minShade, maxShade) => {
  const color = React.useMemo(() => {
    const color = generate(hash(key), minShade, maxShade)
    return color
  }, [key, minShade, maxShade])

  return color
}

export default useRandomColor
