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

/**
 *
 * @param {number} hash
 * @return {string} color
 */
export const generate = (hash, minShade = 1, maxShade = 3) => {
  const shade = ((hash % (maxShade - minShade)) + minShade) * 100
  const hue = hash % N
  return colors[hue][shade]
}
