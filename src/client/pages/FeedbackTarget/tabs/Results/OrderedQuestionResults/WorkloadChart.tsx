import { Box } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'

import { getWorkloadColor } from '../../../../../util/resultColors'
import { getMean, getMeanOption } from '../QuestionResults/AverageResult'
import { formatPercent, getOptionCounts } from './counts'

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
const point = (radius: number, angle: number) => {
  const radians = (angle * Math.PI) / 180
  return [CENTER_X + radius * Math.cos(radians), CENTER_Y - radius * Math.sin(radians)]
}

const wedgePath = (radius: number, from: number, to: number) => {
  const [startX, startY] = point(radius, from)
  const [endX, endY] = point(radius, to)
  return `M ${CENTER_X} ${CENTER_Y} L ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY} Z`
}

// The options from lightest to heaviest as wedges of a half circle, each filled so that the filled area is its share
// of the answers, with a needle pointing at the mean
const WorkloadChart = ({ question }: { question: ResultQuestion }) => {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const options = getOptionCounts(question, i18n.language)

  const total = options.reduce((sum, option) => sum + option.count, 0)
  const wedgeAngle = 180 / options.length
  const mean = getMean(question)
  const meanOptionId = mean > 0 ? getMeanOption(mean, question)?.id : undefined
  const meanOption = options.find(option => option.id === meanOptionId)
  // The options run from the right end, so the heaviest is on the right
  const needleAngle = mean > 0 ? (mean - 0.5) * wedgeAngle : null

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
          const middle = (from + to) / 2
          const [labelX, labelY] = point(RADIUS + 10, middle)
          const cos = Math.cos((middle * Math.PI) / 180)
          const anchor = cos < -0.3 ? 'end' : cos > 0.3 ? 'start' : 'middle'
          // The label above the top wedge stacks upwards, the others sit beside their wedge
          const firstLineY = anchor === 'middle' ? labelY - 20 : labelY - 4

          return (
            <g key={option.id}>
              <path d={wedgePath(RADIUS, from, to)} fill={alpha(color, 0.3)} />
              {share > 0 && <path d={wedgePath(Math.sqrt(share) * RADIUS, from, to)} fill={color} />}
              <text
                x={labelX}
                textAnchor={anchor}
                fontFamily={theme.typography.fontFamily}
                fontSize={13}
                fill={option === meanOption ? theme.palette.text.primary : theme.palette.text.secondary}
                fontWeight={option === meanOption ? theme.typography.fontWeightMedium : undefined}
              >
                <tspan x={labelX} y={firstLineY}>
                  {option.label}
                </tspan>
                <tspan x={labelX} y={firstLineY + 15} fill={theme.palette.text.primary}>
                  {`${option.count} (${formatPercent(option.count, total)})`}
                </tspan>
              </text>
            </g>
          )
        })}
        {/* Lines between the wedges */}
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
          <g fill={theme.palette.text.primary}>
            <polygon
              points={[point(RADIUS * 0.92, needleAngle), point(4, needleAngle + 90), point(4, needleAngle - 90)]
                .map(([x, y]) => `${x},${y}`)
                .join(' ')}
            />
            <circle cx={CENTER_X} cy={CENTER_Y} r={6} />
          </g>
        )}
      </Box>
    </Box>
  )
}

export default WorkloadChart
