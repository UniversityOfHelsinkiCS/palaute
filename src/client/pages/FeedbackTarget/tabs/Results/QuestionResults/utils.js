import { countBy, flatMap } from 'lodash-es'
import { useTheme } from '@mui/material'

import { getLanguageValue } from '../../../../../util/languageUtils'
import { getColor } from '../../../../../util/resultColors'

const COMMA_REPLACE = /,/g

const getScalesConfig = totalFeedbacks => ({
  y: {
    grid: {
      display: false,
      drawBorder: false,
    },
    ticks: {
      font: {
        size: 12,
      },
      display: true,
      showLabelBackdrop: false,
      callback(value) {
        const lbl = this.getLabelForValue(value)
        if (typeof lbl === 'string' && lbl.length > 16) {
          return `${lbl.substring(0, 16)}...`
        }
        return lbl
      },
    },
  },
  x: {
    ticks: {
      precision: 0,
    },
    totalFeedbacks,
  },
})

const getAspectRatio = numberOfOptions => Math.min(1.05 / (numberOfOptions / 6), 1.3)

const getChartOptions = (numberOfOptions, totalFeedbacks) => ({
  indexAxis: 'y',
  scales: getScalesConfig(totalFeedbacks),
  maintainAspectRatio: true,
  aspectRatio: getAspectRatio(numberOfOptions),
  layout: {
    padding: {
      right: 45,
    },
  },
  interaction: {
    intersect: false,
    mode: 'nearest',
    axis: 'y',
  },
  plugins: {
    legend: {
      display: false,
    },
    datalabels: {
      display: true,
      color: 'black',
      clamp: true,
      align: 'end',
      anchor: 'end',
      offset: 0,
      formatter: v => `${v} (${((v / totalFeedbacks) * 100).toFixed()} %)`,
    },
    tooltip: {
      callbacks: {
        label: context => {
          const v = context.parsed.x
          return `${v} (${((v / totalFeedbacks) * 100).toFixed()} %)`
        },
        title: context => String(context[0]?.label ?? '').replace(COMMA_REPLACE, '\n'),
      },
    },
  },
})

export const getLikertChartConfig = (question, language, t, numberOfFeedbacks) => {
  const labels = [5, 4, 3, 2, 1, 0]
  const countByLabel = countBy(question.feedbacks, ({ data }) => data ?? '_')
  const data = labels.map(l => countByLabel[l] ?? 0)
  const dontKnowOption = t('feedbackView:dontKnowOption')
  const displayLabels = ['5', '4', '3', '2', '1', dontKnowOption].map(l => [l])

  return {
    options: getChartOptions(labels.length, numberOfFeedbacks),
    data: {
      labels: displayLabels,
      datasets: [
        {
          data,
          backgroundColor: data.map((v, i) => getColor(5 - i)),
        },
      ],
    },
  }
}

export const getMultipleChoiceChartConfig = (question, language, t, numberOfFeedbacks) => {
  const theme = useTheme()

  const arrayOptions = question.data?.options ?? []

  const labels = arrayOptions.map(({ label }) => getLanguageValue(label, language), 80)

  const flatFeedbacks = flatMap(question.feedbacks, ({ data }) => data ?? [])
  const countByOptionId = countBy(flatFeedbacks, option => option)
  const data = arrayOptions.map(({ id }) => countByOptionId[id] ?? 0)

  return {
    options: getChartOptions(arrayOptions.length, numberOfFeedbacks),
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: theme.palette.primary.light,
        },
      ],
    },
  }
}

export const getSingleChoiceChartConfig = (question, language, t, numberOfFeedbacks) => {
  const theme = useTheme()

  const arrayOptions = question.data?.options ?? []

  const labels = arrayOptions.map(({ label }) => getLanguageValue(label, language), 80)

  const countByOptionId = countBy(question.feedbacks, ({ data }) => data ?? '_')

  const data = arrayOptions.map(({ id }) => countByOptionId[id] ?? 0)

  return {
    options: getChartOptions(arrayOptions.length, numberOfFeedbacks),
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: theme.palette.primary.light,
        },
      ],
    },
  }
}
