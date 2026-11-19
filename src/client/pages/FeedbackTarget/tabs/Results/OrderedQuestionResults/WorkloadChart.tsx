import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'

import { getWorkloadColor } from '../../../../../util/resultColors'
import { getMean, getMeanOption } from '../QuestionResults/AverageResult'
import { formatPercent, getOptionCounts } from './counts'
import { CHART_SX } from './layout'
import { ASCENT, FONT_SIZE, LABEL_HEIGHT, layoutLabels, LINE_HEIGHT, toRadians } from './workloadLabels'

const RADIUS = 150
// Room for the labels beside and above the half circle
const SIDE = 110
const TOP = 40
const BOTTOM = 12
const WIDTH = 2 * (RADIUS + SIDE)
const HEIGHT = TOP + RADIUS + BOTTOM
const CENTER_X = RADIUS + SIDE
const CENTER_Y = TOP + RADIUS

// Angles in degrees, 180 being the left end of the half circle and 0 the right
const point = (radius: number, angle: number) => [
  CENTER_X + radius * Math.cos(toRadians(angle)),
  CENTER_Y - radius * Math.sin(toRadians(angle)),
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
  return `M ${CENTER_X} ${CENTER_Y} L ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY} Z`
}

// Each wedge is filled so that the filled area, not the radius, is its share of the answers
const WorkloadChart = ({ question }: { question: ResultQuestion }) => {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
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
  const labelPositions = layoutLabels(
    RADIUS,
    labels.map(({ text, countText, fontWeight }) =>
      [text, countText].map(line =>
        measureText(line, `${fontWeight ?? 400} ${FONT_SIZE}px ${theme.typography.fontFamily}`)
      )
    )
  )

  const label = [
    ...options.map(option => `${option.label}: ${option.count}`),
    meanOption && `${t('feedbackSummary:average')}: ${meanOption.label}`,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        ...CHART_SX,
        printColorAdjust: 'exact',
        '@media print': { breakInside: 'avoid' },
      }}
    >
      <Box
        component="svg"
        role="img"
        aria-label={label}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        sx={{ width: '100%', maxWidth: WIDTH, height: 'auto', overflow: 'visible' }}
      >
        {options.map((option, index) => {
          const to = index * wedgeAngle
          const from = to + wedgeAngle
          const color = getWorkloadColor(index + 1)
          const share = total > 0 ? option.count / total : 0
          const { text, countText, fontWeight } = labels[index]
          const labelX = CENTER_X + labelPositions[index].x
          const firstLineY = CENTER_Y - labelPositions[index].y - LABEL_HEIGHT / 2 + ASCENT

          return (
            <g key={option.id}>
              <path d={wedgePath(RADIUS, from, to)} fill={theme.palette.action.hover} />
              {share > 0 && <path d={wedgePath(Math.sqrt(share) * RADIUS, from, to)} fill={color} />}
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
          const [x, y] = point(RADIUS, 180 - (index + 1) * wedgeAngle)
          return (
            <line
              key={option.id}
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={x}
              y2={y}
              stroke={theme.palette.background.paper}
              strokeWidth={2}
            />
          )
        })}
        {needleAngle !== null && (
          <g transform={`translate(${CENTER_X} ${CENTER_Y}) rotate(${-needleAngle})`}>
            {[
              { color: theme.palette.background.paper, outline: 1.5 },
              { color: theme.palette.action.hover, outline: 1.5 },
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
