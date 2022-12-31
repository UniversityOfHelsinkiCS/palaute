import groupBy from 'lodash/groupBy'
import countBy from 'lodash/countBy'
import flatMap from 'lodash/flatMap'
import { useTheme } from '@mui/material'

import { getLanguageValue } from '../../../util/languageUtils'

const INCLUDED_TYPES = ['MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'LIKERT', 'OPEN']

const WORKLOAD_QUESTION_ID = 1042

const getScalesConfig = t => ({
  y: {
    title: {
      display: true,
      text: t('questionResults:answerCount'),
    },
    ticks: {
      precision: 0,
    },
  },
  x: {
    title: {
      display: true,
      text: t('questionResults:answerOption'),
    },
  },
})

export const getLikertChartConfig = (question, language, t) => {
  const theme = useTheme()

  const labels = [1, 2, 3, 4, 5, 0]

  const countByLabel = countBy(question.feedbacks, ({ data }) => data ?? '_')
  const data = labels.map(l => countByLabel[l] ?? 0)

  const dontKnowOption = t('feedbackView:dontKnowOption')

  return {
    options: {
      scales: getScalesConfig(t),
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    data: {
      labels: ['1', '2', '3', '4', '5', dontKnowOption],
      datasets: [
        {
          data,
          backgroundColor: theme.palette.primary.main,
        },
      ],
    },
  }
}

export const getMultipleChoiceChartConfig = (question, language, t) => {
  const theme = useTheme()

  const arrayOptions = question.data?.options ?? []

  const labels = arrayOptions.map(({ label }) => getLanguageValue(label, language))

  const flatFeedbacks = flatMap(question.feedbacks, ({ data }) => data ?? [])
  const countByOptionId = countBy(flatFeedbacks, option => option)
  const data = arrayOptions.map(({ id }) => countByOptionId[id] ?? 0)

  return {
    options: {
      scales: getScalesConfig(t),
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: theme.palette.primary.main,
        },
      ],
    },
  }
}

export const getSingleChoiceChartConfig = (question, language, t) => {
  const theme = useTheme()

  const arrayOptions = question.data?.options ?? []

  let labels = arrayOptions.map(({ label }) => getLanguageValue(label, language))

  const countByOptionId = countBy(question.feedbacks, ({ data }) => data ?? '_')

  let data = arrayOptions.map(({ id }) => countByOptionId[id] ?? 0)

  if (question.id === WORKLOAD_QUESTION_ID) {
    labels = labels.reverse()
    data = data.reverse()
  }

  return {
    options: {
      scales: getScalesConfig(t),
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: theme.palette.primary.main,
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
    .reduce((acc, feedback) => [...acc, ...(Array.isArray(feedback.data) ? feedback.data : [])], []) // filter short answers which are not a number
    .filter(answer => answer.data?.length > 1 === Number.isNaN(Number(answer.data)))

  const feedbackDataByQuestionId = groupBy(feedbackData, ({ questionId }) => questionId ?? '_')

  return questions
    .filter(q => INCLUDED_TYPES.includes(q.type))
    .map(q => ({
      ...q,
      feedbacks: feedbackDataByQuestionId[q.id] ?? [],
    }))
}

const feedbacksNoZero = feedbacks => feedbacks.filter(feedback => parseInt(feedback.data, 10) > 0)

export const countAverage = feedbacks => {
  const filteredFeedbacks = feedbacksNoZero(feedbacks)

  if (filteredFeedbacks.length === 0) {
    return 0
  }

  const sum = filteredFeedbacks.reduce((a, b) => a + parseInt(b.data, 10), 0)
  return (sum / filteredFeedbacks.length).toFixed(2)
}

export const countStandardDeviation = feedbacks => {
  const filteredFeedbacks = feedbacksNoZero(feedbacks)
  const n = filteredFeedbacks.length
  const avg = countAverage(filteredFeedbacks)

  if (filteredFeedbacks.length === 0) return 0

  return Math.sqrt(filteredFeedbacks.map(f => (parseInt(f.data, 10) - avg) ** 2).reduce((a, b) => a + b) / n).toFixed(2)
}

export const countMedian = feedbacks => {
  const filteredFeedbacks = feedbacksNoZero(feedbacks)
  if (filteredFeedbacks.length === 0) return 0

  filteredFeedbacks.sort((a, b) => a.data - b.data)

  const half = Math.floor(filteredFeedbacks.length / 2)

  if (filteredFeedbacks.length % 2) return filteredFeedbacks[half].data

  return (parseInt(filteredFeedbacks[half - 1].data, 10) + parseInt(filteredFeedbacks[half].data, 10)) / 2.0
}
