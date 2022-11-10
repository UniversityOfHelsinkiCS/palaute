/* eslint-disable no-bitwise */
import {
  amber,
  blue,
  deepOrange,
  deepPurple,
  green,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from '@mui/material/colors'

const colors = [
  amber,
  blue,
  deepOrange,
  deepPurple,
  green,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
]
const N = colors.length

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const hash = (s) =>
  s.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

/**
 *
 * @param {number | string} seed
 * @return {string} color
 */
export const generate = (seed, minShade = 1, maxShade = 4) => {
  const h = hash(String(seed))
  const shade = ((h % (maxShade - minShade)) + minShade) * 100
  const hue = h % N
  return colors[hue][shade]
}
