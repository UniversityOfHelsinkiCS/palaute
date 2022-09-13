import { startOfDay, subDays } from 'date-fns'
import _ from 'lodash'
import React from 'react'
import 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import { Box, Paper } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { fi, sv, enGB as en } from 'date-fns/locale'

const getGradient = (ctx, chartArea) => {
  if (!ctx) return 'hsl(300deg  49% 56%)'
  const g = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
  g.addColorStop(0.0, 'hsl(261deg  63% 61%)')
  g.addColorStop(0.07, 'hsl(300deg  49% 56%)')
  g.addColorStop(0.16, 'hsl(326deg  79% 64%)')
  g.addColorStop(0.26, 'hsl(343deg 100% 71%)')
  g.addColorStop(0.37, 'hsl(  1deg 100% 75%)')
  g.addColorStop(0.5, 'hsl( 18deg 100% 73%)')
  g.addColorStop(0.62, 'hsl( 30deg 100% 73%)')
  g.addColorStop(0.75, 'hsl( 41deg  91% 74%)')
  g.addColorStop(0.88, 'hsl( 58deg  69% 76%)')
  g.addColorStop(1.0, 'hsl( 86deg 100% 86%)')
  return g
}

const localeForLanguage = { fi, sv, en }

const FeedbackChart = ({ feedbacks, studentCount, opensAt, closesAt }) => {
  const { t, i18n } = useTranslation()
  const chartRef = React.useRef()

  const config = React.useMemo(() => {
    const chart = chartRef.current
    const gradient = getGradient(chart?.ctx, chart?.chartArea)

    const data = [{ x: subDays(Date.parse(opensAt), 1), y: 0 }].concat(
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

    const config = {
      type: 'line',
      data: {
        datasets: [
          {
            data,
            tension: 0.1,
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
            text: 'Feedbacks',
            display: true,
          },
          legend: {
            display: false,
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
            max: Date.parse(closesAt),
            adapters: { date: { locale: localeForLanguage[i18n.language] } },
            ticks: { major: { enabled: true } },
          },
          y: {
            title: {
              display: true,
              text: t('questionResults:feedbackPercent'),
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
            borderWidth: 3.5,
          },
          point: {
            radius: 5,
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
