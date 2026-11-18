// Where the labels of the workload chart go. Positions are in pixels from the centre of its half circle, upwards being
// positive, and angles in degrees, 180 being the left end of the half circle and 0 the right.

export const FONT_SIZE = 13
export const LINE_HEIGHT = 15
// From the baseline of a line up to the top of its capitals and down to the bottom of its descenders
export const ASCENT = 10
const DESCENT = 3
export const LABEL_HEIGHT = ASCENT + LINE_HEIGHT + DESCENT
const LINE_HALF_HEIGHT = (ASCENT + DESCENT) / 2
// Upwards from the middle of a label to the middle of each of its two lines
const LINE_OFFSETS = [LABEL_HEIGHT / 2 - LINE_HALF_HEIGHT, LINE_HALF_HEIGHT - LABEL_HEIGHT / 2]
const LABEL_GAP = 10

type Box = { x: number; y: number; halfWidth: number; halfHeight: number }

const ORIGIN: Box = { x: 0, y: 0, halfWidth: 0, halfHeight: 0 }

export const toRadians = (angle: number) => (angle * Math.PI) / 180

const boxGap = (a: Box, b: Box) =>
  Math.hypot(
    Math.max(Math.abs(a.x - b.x) - a.halfWidth - b.halfWidth, 0),
    Math.max(Math.abs(a.y - b.y) - a.halfHeight - b.halfHeight, 0)
  )

const labelGap = (a: Box[], b: Box[]) => Math.min(...a.flatMap(lineA => b.map(lineB => boxGap(lineA, lineB))))

// The value between start and end at which isShort turns false, it being true at start
const bisect = (start: number, end: number, isShort: (value: number) => boolean) => {
  let low = start
  let high = end
  for (let step = 0; step < 15; step += 1) {
    const middle = (low + high) / 2
    if (isShort(middle)) low = middle
    else high = middle
  }
  return high
}

const linesAt = (distance: number, angle: number, lineWidths: number[]): Box[] =>
  lineWidths.map((width, index) => ({
    x: distance * Math.cos(toRadians(angle)),
    y: distance * Math.sin(toRadians(angle)) + LINE_OFFSETS[index],
    halfWidth: width / 2,
    halfHeight: LINE_HALF_HEIGHT,
  }))

// How far in the direction of the angle a label goes, so that its line nearest to the arc is LABEL_GAP off it
const labelDistance = (radius: number, angle: number, lineWidths: number[]) =>
  bisect(0, 3 * radius, distance => labelGap(linesAt(distance, angle, lineWidths), [ORIGIN]) < radius + LABEL_GAP)

const placedLines = (radius: number, angle: number, lineWidths: number[]) =>
  linesAt(labelDistance(radius, angle, lineWidths), angle, lineWidths)

// The angle between those of the outer and the top label at which a label is as far from both of them
const balancedAngle = (
  radius: number,
  outerAngle: number,
  outerWidths: number[],
  topWidths: number[],
  lineWidths: number[]
) => {
  const outer = placedLines(radius, outerAngle, outerWidths)
  const top = placedLines(radius, 90, topWidths)
  return bisect(outerAngle, 90, angle => {
    const lines = placedLines(radius, angle, lineWidths)
    return labelGap(outer, lines) < labelGap(lines, top)
  })
}

// The middle of each label, given the widths of its two lines. With five options, the diagonal labels move along the
// arc to be as far from the top label as from the outer one.
export const layoutLabels = (radius: number, lineWidths: number[][]) => {
  const wedgeAngle = 180 / lineWidths.length
  const angles = lineWidths.map((_, index) => (index + 0.5) * wedgeAngle)
  if (lineWidths.length === 5) {
    angles[1] = balancedAngle(radius, angles[0], lineWidths[0], lineWidths[2], lineWidths[1])
    angles[3] = balancedAngle(radius, angles[4], lineWidths[4], lineWidths[2], lineWidths[3])
  }

  return angles.map((angle, index) => {
    const distance = labelDistance(radius, angle, lineWidths[index])
    return { x: distance * Math.cos(toRadians(angle)), y: distance * Math.sin(toRadians(angle)) }
  })
}
