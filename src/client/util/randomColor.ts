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

export const generate = (hash: number, minShade = 1, maxShade = 3): string => {
  const shade = ((hash % (maxShade - minShade)) + minShade) * 100
  const hue = hash % N
  return colors[hue][shade]
}
