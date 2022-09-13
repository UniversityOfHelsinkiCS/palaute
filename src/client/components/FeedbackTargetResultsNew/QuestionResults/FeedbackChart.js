import { startOfDay } from 'date-fns'
import _ from 'lodash'
import React from 'react'
import 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import { Box, Paper } from '@mui/material'

const FeedbackChart = ({ feedbacks, studentCount, opensAt, closesAt }) => {
  const config = React.useMemo(() => {
    const data = _.sortBy(
      Object.entries(
        _.groupBy(feedbacks, (f) =>
          startOfDay(Date.parse(f.createdAt)).getTime(),
        ),
      ).map(([date, feedbacks]) => ({
        x: Number(date),
        y: (feedbacks.length / studentCount) * 100.0,
      })),
      'x',
    )

    for (let i = 1; i < data.length; i++) {
      data[i].y += data[i - 1].y
    }

    // console.log(data)
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
            },
            min: Date.parse(opensAt),
            max: Date.parse(closesAt),
          },
          y: {
            title: {
              display: true,
              text: 'value',
            },
            min: 0,
            max: 100,
          },
        },
      },
    }
    return config
  }, [feedbacks])

  return (
    <Paper>
      <Box height="20rem" my="2rem" p="1rem" py="2rem">
        <Line {...config} />
      </Box>
    </Paper>
  )
}

export default FeedbackChart
