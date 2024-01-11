const _ = require('lodash')

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

/**
 * Only used for WORKLOAD questions
 * @param {*} distribution
 * @param {*} question
 * @returns
 */
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

const getMean = (distribution, question) => {
  switch (question.type) {
    case 'LIKERT':
      return getLikertMean(distribution)
    case 'SINGLE_CHOICE':
      return getSingleChoiceMean(distribution, question)
    default:
      return 0
  }
}

module.exports = {
  getMean,
}
