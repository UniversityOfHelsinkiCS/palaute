import { startOfDay, subDays } from 'date-fns'
import _ from 'lodash'
import React from 'react'
import 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import { Box, Paper, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { fi, sv, enGB as en } from 'date-fns/locale'

const FeedbackChart = ({ feedbacks, studentCount, opensAt, closesAt }) => {
  const theme = useTheme()
  const { t, i18n } = useTranslation()
  const localeForLanguage = { fi, sv, en }

  const config = React.useMemo(() => {
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
            borderColor: theme.palette.success.light,
          },
          point: {
            radius: 4,
          },
        },
        interaction: {
          intersect: false,
        },
      },
    }
    return config
  }, [feedbacks])

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
          <Line {...config} />
        </Box>
      </Box>
    </Paper>
  )
}

export default FeedbackChart
