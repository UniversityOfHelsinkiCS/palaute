/* eslint-disable no-bitwise */
import React from 'react'
import { generate } from '../util/randomColor'

const hash = (s: string): number =>
  Math.abs(
    s.split('').reduce((a, b) => {
      // eslint-disable-next-line no-param-reassign
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
  )

const useRandomColor = (key: string, minShade?: number, maxShade?: number): string => {
  const color = React.useMemo(() => generate(hash(key), minShade, maxShade), [key, minShade, maxShade])
  return color
}

export default useRandomColor
