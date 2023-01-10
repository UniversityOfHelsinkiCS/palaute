import React from 'react'
import _ from 'lodash'
import SummaryResultItem from '../../../../../components/SummaryResultItem'

const styles = {
  resultItem: {
    width: '3rem',
    height: '3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '0.4rem',
  },
}

const getDistribution = feedbacks => _.countBy(feedbacks, f => String(f.data))

const getLikertMean = distribution => {
  const entries = [
    distribution['1'] || 0,
    distribution['2'] || 0,
    distribution['3'] || 0,
    distribution['4'] || 0,
    distribution['5'] || 0,
  ]

  // hack to convert possible strings to numbers when doing math
  const totalCount = -(-entries[0] - entries[1] - entries[2] - entries[3] - entries[4])

  if (totalCount === 0) return 0

  let sum = 0
  for (let i = 0; i < entries.length; i++) {
    const count = entries[i]
    const value = i + 1
    sum += value * count
  }

  return _.round(sum / totalCount, 2)
}

const getSingleChoiceMean = (distribution, question) => {
  const entries = []

  for (let i = 0; i < question.data.options.length; i++) {
    const optionId = question.data.options[i].id
    entries.push(distribution[optionId] || 0)
  }

  // hack to convert possible strings to numbers when doing math
  const totalCount = -(-entries[0] - entries[1] - entries[2] - entries[3] - entries[4])

  if (totalCount === 0) return 0

  let sum = 0
  for (let i = 0; i < entries.length; i++) {
    const count = entries[i]
    const value = i + 1
    sum += value * count
  }

  return _.round(sum / totalCount, 2)
}

const getMean = (question, distribution) => {
  switch (question.type) {
    case 'LIKERT':
      return getLikertMean(distribution)
    case 'SINGLE_CHOICE':
      return getSingleChoiceMean(distribution, question)
    default:
      return 0
  }
}

const AverageResult = ({ question }) => {
  const distribution = getDistribution(question.feedbacks)
  const mean = getMean(question, distribution)

  return (
    <SummaryResultItem
      mean={mean}
      distribution={distribution}
      question={question}
      component="div"
      sx={styles.resultItem}
    />
  )
}

export default AverageResult
