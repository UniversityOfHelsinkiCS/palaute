import groupBy from 'lodash/groupBy'
import countBy from 'lodash/countBy'
import flatMap from 'lodash/flatMap'
import { useTheme } from '@mui/material'

import { getLanguageValue } from '../../../util/languageUtils'
import { getColor } from '../../../util/resultColors'

const INCLUDED_TYPES = ['MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'LIKERT', 'OPEN']

// const WORKLOAD_QUESTION_ID = 1042

/**
 * https://stackoverflow.com/questions/21409717/chart-js-and-long-labels
 * Takes a string phrase and breaks it into separate phrases
 * no bigger than 'maxwidth', breaks are made at complete words.
 */
const formatLabel = (str, maxwidth) => {
  const sections = []
  const words = str.split(' ')
  let temp = ''

  words.forEach((item, index) => {
    if (temp.length > 0) {
      const concat = `${temp} ${item}`

      if (concat.length > maxwidth) {
        sections.push(temp)
        temp = ''
      } else if (index === words.length - 1) {
        sections.push(concat)
        return
      } else {
        temp = concat
        return
      }
    }

    if (index === words.length - 1) {
      sections.push(item)
      return
    }

    if (item.length < maxwidth) {
      temp = item
    } else {
      sections.push(item)
    }
  })

  return sections
}

const getScalesConfig = (t, max) => ({
  y: {
    title: {
      display: true,
      text: t('questionResults:answerOption'),
    },
    grid: {
      display: false,
      drawBorder: false,
    },
  },
  x: {
    title: {
      display: true,
      text: t('questionResults:answerCount'),
    },
    ticks: {
      precision: 0,
    },
    max,
  },
})

const getOptions = (question, t, language, max) => ({
  indexAxis: 'y',
  scales: getScalesConfig(t, max),
  responsive: true,
  aspectRatio: 1.5,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: formatLabel(getLanguageValue(question.data?.label, language), 65),
    },
  },
})

export const getLikertChartConfig = (question, language, t, max) => {
  const labels = [5, 4, 3, 2, 1, 0]

  const countByLabel = countBy(question.feedbacks, ({ data }) => data ?? '_')
  const data = labels.map((l) => countByLabel[l] ?? 0)

  const dontKnowOption = t('feedbackView:dontKnowOption')

  return {
    options: getOptions(question, t, language, max),
    data: {
      labels: ['5', '4', '3', '2', '1', dontKnowOption],
      datasets: [
        {
          data,
          backgroundColor: data.map((v, i) => getColor(5 - i)),
        },
      ],
    },
  }
}

export const getMultipleChoiceChartConfig = (question, language, t, max) => {
  const theme = useTheme()

  const arrayOptions = question.data?.options ?? []

  const labels = arrayOptions.map(({ label }) =>
    formatLabel(getLanguageValue(label, language), 20),
  )

  const flatFeedbacks = flatMap(question.feedbacks, ({ data }) => data ?? [])
  const countByOptionId = countBy(flatFeedbacks, (option) => option)
  const data = arrayOptions.map(({ id }) => countByOptionId[id] ?? 0)

  return {
    options: getOptions(question, t, language, max),
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

export const getSingleChoiceChartConfig = (question, language, t, max) => {
  const theme = useTheme()

  const arrayOptions = question.data?.options ?? []

  const labels = arrayOptions.map(({ label }) =>
    formatLabel(getLanguageValue(label, language), 30),
  )

  const countByOptionId = countBy(question.feedbacks, ({ data }) => data ?? '_')

  const data = arrayOptions.map(({ id }) => countByOptionId[id] ?? 0)

  return {
    options: getOptions(question, t, language, max),
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

export const getQuestionsWithFeedback = (questions, feedbacks) => {
  if (!questions) {
    return []
  }

  const feedbacksArray = feedbacks ?? []

  const feedbackData = feedbacksArray
    .reduce(
      (acc, feedback) => [
        ...acc,
        ...(Array.isArray(feedback.data) ? feedback.data : []),
      ],
      [],
    ) // filter short answers which are not a number
    .filter(
      (answer) => answer.data?.length > 1 === Number.isNaN(Number(answer.data)),
    )

  const feedbackDataByQuestionId = groupBy(
    feedbackData,
    ({ questionId }) => questionId ?? '_',
  )

  return questions
    .filter((q) => INCLUDED_TYPES.includes(q.type))
    .map((q) => ({
      ...q,
      feedbacks: feedbackDataByQuestionId[q.id] ?? [],
    }))
}

const feedbacksNoZero = (feedbacks) =>
  feedbacks.filter((feedback) => parseInt(feedback.data, 10) > 0)

export const countAverage = (feedbacks) => {
  const filteredFeedbacks = feedbacksNoZero(feedbacks)

  if (filteredFeedbacks.length === 0) {
    return 0
  }

  const sum = filteredFeedbacks.reduce((a, b) => a + parseInt(b.data, 10), 0)
  return (sum / filteredFeedbacks.length).toFixed(2)
}

export const countStandardDeviation = (feedbacks) => {
  const filteredFeedbacks = feedbacksNoZero(feedbacks)
  const n = filteredFeedbacks.length
  const avg = countAverage(filteredFeedbacks)

  if (filteredFeedbacks.length === 0) return 0

  return Math.sqrt(
    filteredFeedbacks
      .map((f) => (parseInt(f.data, 10) - avg) ** 2)
      .reduce((a, b) => a + b) / n,
  ).toFixed(2)
}

export const countMedian = (feedbacks) => {
  const filteredFeedbacks = feedbacksNoZero(feedbacks)
  if (filteredFeedbacks.length === 0) return 0

  filteredFeedbacks.sort((a, b) => a.data - b.data)

  const half = Math.floor(filteredFeedbacks.length / 2)

  if (filteredFeedbacks.length % 2) return filteredFeedbacks[half].data

  return (
    (parseInt(filteredFeedbacks[half - 1].data, 10) +
      parseInt(filteredFeedbacks[half].data, 10)) /
    2.0
  )
}
