import { addHours, startOfDay, subDays } from 'date-fns'
import { groupBy, sortBy } from 'lodash-es'
import React from 'react'
import 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { localeForLanguage } from '../../../../../util/languageUtils'

const getGradient = (ctx, chartArea) => {
  if (!ctx) return 'hsl(300deg 49% 56%)'
  const g = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
  g.addColorStop(0.0, 'hsl(261deg 63% 61%)')
  g.addColorStop(0.06, 'hsl(300deg 49% 56%)')
  g.addColorStop(0.15, 'hsl(326deg 79% 64%)')
  g.addColorStop(0.26, 'hsl(343deg 100% 71%)')
  g.addColorStop(0.38, 'hsl(1deg 100% 75%)')
  g.addColorStop(0.51, 'hsl(18deg 100% 73%)')
  g.addColorStop(0.63, 'hsl(30deg 100% 73%)')
  g.addColorStop(0.76, 'hsl(41deg 91% 74%)')
  g.addColorStop(0.89, 'hsl(58deg 69% 76%)')
  g.addColorStop(1.0, 'hsl(86deg 100% 86%)')
  return g
}

const annotationLineColor = '#5f8faf'
const labelBackgroundColor = '#0f0f0fa0'
const labelTextColor = '#5f8fbf'

const getLineAnnotation = (label, x) => ({
  type: 'line',
  borderColor: annotationLineColor,
  borderDash: [6, 6],
  borderWidth: 1,
  label: {
    content: label,
    position: 'center',
    display: true,
    backgroundColor: 'white',
    color: labelTextColor,
    rotation: -90,
    font: { size: 12, weigth: 'lighter' },
  },
  scaleID: 'x',
  value: x,
})

const buildChartConfig = (
  chart,
  feedbacks,
  studentCount,
  opensAt,
  closesAt,
  feedbackReminderLastSentAt,
  t,
  language
) => {
  const gradient = getGradient(chart?.ctx, chart?.chartArea)

  const initialData = sortBy(
    Object.entries(groupBy(feedbacks, f => addHours(startOfDay(Date.parse(f.createdAt)), 12).getTime())).map(
      ([date, feedbacks]) => ({
        x: Number(date),
        y: feedbacks.length / studentCount,
      })
    ),
    'x'
  )

  const opensAtDate = startOfDay(Date.parse(opensAt)).getTime()

  const chartMin = Math.min(
    subDays(Date.now(), 1),
    subDays(opensAtDate, 1),
    subDays(initialData[0]?.x ?? Date.now(), 1)
  )
  const chartMax = subDays(Date.parse(closesAt), -1)
  const firstVisibleDataPoint = Math.min(opensAtDate, Date.now(), addHours(initialData[0]?.x ?? Date.now(), -12))

  const data = [
    { x: 0, y: 0 },
    { x: firstVisibleDataPoint, y: 0 },
  ].concat(initialData)

  for (let i = 2; i < data.length; i++) {
    data[i].y += data[i - 1].y // cumsum
  }

  if (Date.now() > data[data.length - 1].x) {
    data.push({
      x: Date.now(),
      y: data[data.length - 1].y,
    }) // add last
  }

  const lastDataPoint = data[data.length - 1]

  const absoluteData = data.map(d => Math.round(d.y * studentCount))

  const valueFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }

  const opensAtAnnotation = getLineAnnotation(t('editFeedbackTarget:opensAt'), opensAtDate)
  const closesAtAnnotation = getLineAnnotation(t('editFeedbackTarget:closesAt'), Date.parse(closesAt))
  const reminderAnnotation = getLineAnnotation(
    t('feedbackTargetResults:reminderLastSent'),
    subDays(Date.parse(feedbackReminderLastSentAt), 1)
  )
  const latestValueAnnotation = {
    type: 'line',
    display: data.length > 2,
    borderColor: annotationLineColor,
    borderDash: [6, 6],
    borderWidth: 1,
    label: {
      content: `${Intl.NumberFormat(localeForLanguage(language)?.code, valueFormatOptions).format(lastDataPoint.y)} (${
        feedbacks.length
      }/${studentCount})`,
      position: 'center',
      yAdjust: 20,
      xAdjust: 10,
      display: true,
      color: labelTextColor,
      backgroundColor: 'white',
    },
    xScaleID: 'x',
    xMin: lastDataPoint.x,
    xMax: chartMax,
    yScaleID: 'y',
    yMin: lastDataPoint.y,
    yMax: lastDataPoint.y,
  }

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
      locale: localeForLanguage(language)?.code,
      responsive: true,
      aspectRatio: 5,
      maintainAspectRatio: false,
      resizeDelay: 100,
      clip: { left: 0, top: false, right: 0, bottom: false },
      layout: {
        padding: {
          right: 50,
        },
      },
      interaction: {
        intersect: false,
        mode: 'nearest',
        axis: 'x',
      },
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
          displayColors: false,
          callbacks: {
            label: tooltip => {
              if (data[tooltip.dataIndex].x <= firstVisibleDataPoint) return null
              const current = absoluteData[tooltip.dataIndex]
              const previous = absoluteData[tooltip.dataIndex - 1]
              return `${tooltip.formattedValue} (+${current - previous})`
            },
            title: ([tooltip]) => {
              if (tooltip.dataIndex === data.length - 1) return t('common:today')
              if (data[tooltip.dataIndex].x === firstVisibleDataPoint) return t('editFeedbackTarget:opensAt')
              return tooltip.label
            },
          },
        },
        annotation: {
          annotations: {
            opensAtAnnotation,
            closesAtAnnotation,
            reminderAnnotation,
            latestValueAnnotation,
          },
        },
        datalabels: {
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
          min: chartMin,
          max: chartMax,
          adapters: { date: { locale: localeForLanguage(language) } },
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
            format: valueFormatOptions,
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
    },
  }
  return config
}

const FeedbackChart = ({ feedbacks, studentCount, opensAt, closesAt, feedbackReminderLastSentAt, showTable }) => {
  const { t, i18n } = useTranslation()
  const chartRef = React.useRef()
  const [config, setConfig] = React.useState({ type: 'line', data: { datasets: [] }, options: {} })
  const chartContainerId = React.useId()
  const summaryId = React.useId()

  React.useEffect(
    () =>
      setConfig(
        buildChartConfig(
          chartRef.current,
          feedbacks,
          studentCount,
          opensAt,
          closesAt,
          feedbackReminderLastSentAt,
          t,
          i18n.language
        )
      ),
    [chartRef, feedbacks]
  )

  const feedbackCount = feedbacks.length
  const responsePercentage = studentCount > 0 ? ((feedbackCount / studentCount) * 100).toFixed(1) : 0

  return (
    <Box
      data-cy="feedback-target-results-feedback-chart"
      my="1rem"
      role="region"
      aria-labelledby={`${chartContainerId}-title`}
      aria-describedby={showTable ? summaryId : undefined}
    >
      <Box id={`${chartContainerId}-title`} sx={{ display: 'none' }}>
        {t('courseSummary:feedbackCount')}
      </Box>

      {/* Chart view */}
      <Box display={showTable ? 'none' : 'flex'} justifyContent="center" width="100%" height="20rem">
        <Box minWidth="80%">
          <Line
            {...config}
            ref={chartRef}
            options={{
              ...config.options,
              plugins: {
                ...config.options?.plugins,
                title: {
                  ...config.options?.plugins?.title,
                  text: t('courseSummary:feedbackCount'),
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Accessible summary view */}
      <Box
        id={summaryId}
        display={showTable ? 'block' : 'none'}
        sx={{
          p: 2,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <h3>{t('courseSummary:feedbackCount')}</h3>
        <p>
          {t('feedbackTargetResults:feedbackSummary', {
            defaultValue: `Total responses: {{count}} out of {{total}} students ({{percentage}}%)`,
            count: feedbackCount,
            total: studentCount,
            percentage: responsePercentage,
          })}
        </p>
        {feedbacks.length > 0 && (
          <p>
            {t('feedbackTargetResults:feedbackTimelineInfo', {
              defaultValue: `Feedback collection opened on {{openDate}} and closes on {{closeDate}}. The chart above shows the cumulative number of responses received over time.`,
              openDate: new Date(opensAt).toLocaleDateString(localeForLanguage(i18n.language)?.code),
              closeDate: new Date(closesAt).toLocaleDateString(localeForLanguage(i18n.language)?.code),
            })}
          </p>
        )}
        <p>
          {t('feedbackTargetResults:chartDescription', {
            defaultValue: 'For the visual chart, use Alt + T to toggle back.',
          })}
        </p>
      </Box>
    </Box>
  )
}

export default FeedbackChart
