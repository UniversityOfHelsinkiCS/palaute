import { startOfDay, subDays } from 'date-fns'
import _ from 'lodash'
import React from 'react'
import 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import annotationPlugin from 'chartjs-plugin-annotation'
import { Chart } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Box, Paper } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { fi, sv, enGB as en } from 'date-fns/locale'

Chart.register(annotationPlugin)
const localeForLanguage = { fi, sv, en }

const getGradient = (ctx, chartArea) => {
  if (!ctx) return 'hsl(300deg  49% 56%)'
  const g = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
  g.addColorStop(0.0, 'hsl(261deg  63% 61%)')
  g.addColorStop(0.06, 'hsl(300deg  49% 56%)')
  g.addColorStop(0.15, 'hsl(326deg  79% 64%)')
  g.addColorStop(0.26, 'hsl(343deg 100% 71%)')
  g.addColorStop(0.38, 'hsl(  1deg 100% 75%)')
  g.addColorStop(0.51, 'hsl( 18deg 100% 73%)')
  g.addColorStop(0.63, 'hsl( 30deg 100% 73%)')
  g.addColorStop(0.76, 'hsl( 41deg  91% 74%)')
  g.addColorStop(0.89, 'hsl( 58deg  69% 76%)')
  g.addColorStop(1.0, 'hsl( 86deg 100% 86%)')
  return g
}

const annotationLineColor = '#5f8faf'
const labelBackgroundColor = '#0f0f0fa0'
const labelTextColor = '#5f8fbf'

const getLineAnnotation = (label, x, y) => ({
  type: 'line',
  borderColor: annotationLineColor,
  borderDash: [6, 6],
  borderWidth: 1,
  label: {
    content: label,
    position: 'start',
    display: true,
    backgroundColor: '#00000000',
    color: labelTextColor,
  },
  scaleID: 'x',
  value: x,
  yScaleID: 'y',
})

const FeedbackChart = ({
  feedbacks,
  studentCount,
  opensAt,
  closesAt,
  feedbackReminderLastSentAt,
}) => {
  const { t, i18n } = useTranslation()
  const chartRef = React.useRef()

  const config = React.useMemo(() => {
    const chart = chartRef.current
    const gradient = getGradient(chart?.ctx, chart?.chartArea)

    const data = [{ x: Date.parse(opensAt), y: 0 }].concat(
      _.sortBy(
        Object.entries(
          _.groupBy(feedbacks, (f) =>
            startOfDay(Date.parse(f.createdAt)).getTime(),
          ),
        ).map(([date, feedbacks]) => ({
          x: Number(date),
          y: feedbacks.length / studentCount,
        })),
        'x',
      ),
    )

    for (let i = 1; i < data.length; i++) {
      data[i].y += data[i - 1].y // cumsum
    }
    data.push({
      x: Date.now(),
      y: data[data.length - 1].y,
    }) // add last

    const absoluteData = data.map((d) => Math.round(d.y * studentCount))

    const opensAtAnnotation = getLineAnnotation(
      t('editFeedbackTarget:opensAt'),
      Date.parse(opensAt),
    )
    const closesAtAnnotation = getLineAnnotation(
      t('editFeedbackTarget:closesAt'),
      subDays(Date.parse(closesAt), 1),
    )
    const reminderAnnotation = getLineAnnotation(
      t('feedbackTargetResults:reminderLastSent'),
      subDays(Date.parse(feedbackReminderLastSentAt), 1),
    )

    const config = {
      type: 'line',
      data: {
        datasets: [
          {
            data,
          },
        ],
      },
      options: {
        locale: i18n.language,
        responsive: true,
        aspectRatio: 5,
        maintainAspectRatio: false,
        resizeDelay: 100,

        plugins: {
          title: {
            text: t('courseSummary:feedbackCount'),
            display: true,
          },
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: labelBackgroundColor,
            callbacks: {
              labelColor: (tooltip) => ({
                backgroundColor: gradient,
                borderWidth: 0,
                borderRadius: 5,
                borderColor: '#ffffff00',
              }),
              label: (tooltip) => {
                if (tooltip.dataIndex === 0)
                  return t('editFeedbackTarget:opensAt')
                const current = absoluteData[tooltip.dataIndex]
                const previous = absoluteData[tooltip.dataIndex - 1]
                return `${tooltip.formattedValue} (+${current - previous})`
              },
              title: ([tooltip]) => {
                if (tooltip.dataIndex === data.length - 1)
                  return t('common:today')
                return tooltip.label
              },
            },
          },
          annotation: {
            annotations: {
              opensAtAnnotation,
              closesAtAnnotation,
              reminderAnnotation,
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              parse: false,
              unit: 'day',
              tooltipFormat: 'MMM d',
            },
            min: subDays(Date.parse(opensAt), 1),
            max: subDays(Date.parse(closesAt), -1),
            adapters: { date: { locale: localeForLanguage[i18n.language] } },
            ticks: { major: { enabled: true } },
          },
          y: {
            title: {
              display: true,
              text: t('courseSummary:feedbackPercentage'),
            },
            min: 0,
            max: 1,
            ticks: {
              format: {
                style: 'percent',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              },
              stepSize: 0.2,
            },
          },
        },
        elements: {
          line: {
            borderColor: gradient,
            borderWidth: 4,
          },
          point: {
            radius: 6,
            borderColor: gradient,
          },
        },
        interaction: {
          intersect: false,
        },
      },
    }
    return config
  }, [feedbacks, chartRef])

  return (
    <Paper>
      <Box
        height="25rem"
        width="100%"
        my="2rem"
        px="2rem"
        py="1.5rem"
        display="flex"
        justifyContent="center"
      >
        <Box minWidth="80%">
          <Line {...config} ref={chartRef} />
        </Box>
      </Box>
    </Paper>
  )
}

export default FeedbackChart
