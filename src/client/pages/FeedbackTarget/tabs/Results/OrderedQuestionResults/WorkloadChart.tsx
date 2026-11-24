import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'

import useElementSize from '../../../../../hooks/useElementSize'
import { getWorkloadColor } from '../../../../../util/resultColors'
import { getMean, getMeanOption } from '../QuestionResults/AverageResult'
import { formatPercent, getOptionCounts } from './counts'
import { CHART_END } from './layout'
import { ASCENT, FONT_SIZE, LABEL_HEIGHT, layoutLabels, LINE_HEIGHT, toRadians } from './workloadLabels'

const RADIUS = 150
// Narrower than this, the whole chart scales down instead, labels included
const MIN_RADIUS = 70
const BOTTOM = 12
// Around the labels, in case the measured text is narrower than the rendered one
const PADDING = 4

// Centred on the middle of the half circle. Angles in degrees, 180 being its left end and 0 the right.
const point = (radius: number, angle: number) => [
  radius * Math.cos(toRadians(angle)),
  -radius * Math.sin(toRadians(angle)),
]

const needlePath = (outline: number) => {
  const tipCenter = RADIUS * 0.92 - 1
  const tipRadius = 1 + outline
  return `M 0 ${-4 - outline} L ${tipCenter} ${-tipRadius} A ${tipRadius} ${tipRadius} 0 0 1 ${tipCenter} ${tipRadius} L 0 ${4 + outline} Z`
}

let measuringContext: CanvasRenderingContext2D | null | undefined

const measureText = (text: string, font: string) => {
  if (measuringContext === undefined) measuringContext = document.createElement('canvas').getContext('2d')
  if (!measuringContext) return 0
  measuringContext.font = font
  return measuringContext.measureText(text).width
}

const wedgePath = (radius: number, from: number, to: number) => {
  const [startX, startY] = point(radius, from)
  const [endX, endY] = point(radius, to)
  return `M 0 0 L ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY} Z`
}

const layoutChart = (radius: number, lineWidths: number[][]) => {
  const labelPositions = layoutLabels(radius, lineWidths)
  const halfWidths = lineWidths.map(widths => Math.max(...widths) / 2)
  const left = Math.min(-radius, ...labelPositions.map(({ x }, index) => x - halfWidths[index] - PADDING))
  const right = Math.max(radius, ...labelPositions.map(({ x }, index) => x + halfWidths[index] + PADDING))
  const top = Math.min(-radius, ...labelPositions.map(({ y }) => -y - LABEL_HEIGHT / 2 - PADDING))
  return { radius, labelPositions, left, top, width: right - left }
}

// Shrinks the half circle rather than the labels to fit the available width
const fitChart = (availableWidth: number | null, lineWidths: number[][]) => {
  let chart = layoutChart(RADIUS, lineWidths)
  if (availableWidth === null) return chart
  // The labels move as the radius changes, so the width beside the half circle is only roughly the same
  for (let step = 0; step < 2 && chart.width > availableWidth && chart.radius > MIN_RADIUS; step += 1) {
    const sideWidth = chart.width - 2 * chart.radius
    chart = layoutChart(Math.max((availableWidth - sideWidth) / 2, MIN_RADIUS), lineWidths)
  }
  return chart
}

// Each wedge is filled so that the filled area, not the radius, is its share of the answers
const WorkloadChart = ({ question }: { question: ResultQuestion }) => {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [availableWidth, setAvailableWidth] = useState<number | null>(null)
  useElementSize(containerRef, ({ width }) => setAvailableWidth(width))
  const options = getOptionCounts(question, i18n.language)

  const total = options.reduce((sum, option) => sum + option.count, 0)
  const wedgeAngle = 180 / options.length
  const mean = getMean(question)
  const meanOptionId = mean > 0 ? getMeanOption(mean, question)?.id : undefined
  const meanOption = options.find(option => option.id === meanOptionId)
  const needleAngle = mean > 0 ? (mean - 0.5) * wedgeAngle : null

  const labels = options.map(option => ({
    text: option.label,
    countText: `${option.count} (${formatPercent(option.count, total)})`,
    fontWeight: option === meanOption ? theme.typography.fontWeightMedium : undefined,
  }))
  const lineWidths = labels.map(({ text, countText, fontWeight }) =>
    [text, countText].map(line =>
      measureText(line, `${fontWeight ?? 400} ${FONT_SIZE}px ${theme.typography.fontFamily}`)
    )
  )
  const { radius, labelPositions, left, top, width } = fitChart(availableWidth, lineWidths)

  const label = [
    ...options.map(option => `${option.label}: ${option.count}`),
    meanOption && `${t('feedbackSummary:average')}: ${meanOption.label}`,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <Box ref={containerRef} sx={{ printColorAdjust: 'exact', '@media print': { breakInside: 'avoid' } }}>
      <Box
        component="svg"
        role="img"
        aria-label={label}
        viewBox={`${left} ${top} ${width} ${BOTTOM - top}`}
        sx={{
          display: 'block',
          width: '100%',
          maxWidth: width,
          height: 'auto',
          overflow: 'visible',
          // Grows into the space beside where the choice bars end before shrinking, centred where they end once it fits
          ml: `max(0px, (100% - ${CHART_END} - ${width}px) / 2)`,
          mr: 'auto',
        }}
      >
        {options.map((option, index) => {
          const to = index * wedgeAngle
          const from = to + wedgeAngle
          const color = getWorkloadColor(index + 1)
          const share = total > 0 ? option.count / total : 0
          const { text, countText, fontWeight } = labels[index]
          const labelX = labelPositions[index].x
          const firstLineY = -labelPositions[index].y - LABEL_HEIGHT / 2 + ASCENT

          return (
            <g key={option.id}>
              <path d={wedgePath(radius, from, to)} fill={theme.palette.action.hover} />
              {share > 0 && <path d={wedgePath(Math.sqrt(share) * radius, from, to)} fill={color} />}
              <text
                x={labelX}
                textAnchor="middle"
                fontFamily={theme.typography.fontFamily}
                fontSize={FONT_SIZE}
                fill={option === meanOption ? theme.palette.text.primary : theme.palette.text.secondary}
                fontWeight={fontWeight}
              >
                <tspan x={labelX} y={firstLineY}>
                  {text}
                </tspan>
                <tspan x={labelX} y={firstLineY + LINE_HEIGHT} fill={theme.palette.text.primary}>
                  {countText}
                </tspan>
              </text>
            </g>
          )
        })}
        {options.slice(1).map((option, index) => {
          const [x, y] = point(radius, 180 - (index + 1) * wedgeAngle)
          return (
            <line key={option.id} x1={0} y1={0} x2={x} y2={y} stroke={theme.palette.background.paper} strokeWidth={2} />
          )
        })}
        {needleAngle !== null && (
          <g transform={`rotate(${-needleAngle}) scale(${radius / RADIUS})`}>
            {[
              { color: theme.palette.background.paper, outline: 1.1 },
              { color: theme.palette.action.hover, outline: 1.1 },
              { color: theme.palette.text.primary, outline: 0 },
            ].map(({ color, outline }) => (
              <g key={color} fill={color} opacity={outline ? 0.7 : 1}>
                <path d={needlePath(outline)} />
                <circle r={6 + outline} />
              </g>
            ))}
          </g>
        )}
      </Box>
    </Box>
  )
}

export default WorkloadChart
