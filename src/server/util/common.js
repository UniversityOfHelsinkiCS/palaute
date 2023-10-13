const { addYears, subDays } = require('date-fns')

const isNumber = value => !Number.isNaN(parseInt(value, 10))

const normalizeOrganisationCode = r => {
  if (r.startsWith('T')) {
    return r.replace('T', '7')
  }
  if (!r.includes('_')) {
    return r
  }

  const [left, right] = r.split('_')
  const prefix = [...left].filter(isNumber).join('')
  const suffix = `${left[0]}${right}`
  const providercode = `${prefix}0-${suffix}`
  return providercode
}

// Year starting month
const MONTH = 8

/**
 *
 * @param {Date | string | number} date
 * @return {Date} first day of study year
 */
const startOfStudyYear = date => {
  let d = null
  if (typeof date !== 'object') {
    d = new Date(date)
  } else {
    d = date
  }

  const year = d.getFullYear() - (d.getMonth() + 1 < MONTH ? 1 : 0)

  return new Date(`${year}-${MONTH}-01`)
}

/**
 *
 * @param {Date | string | number} date
 * @returns {Date} last day of study year
 */
const endOfStudyYear = date => {
  const start = startOfStudyYear(date)
  return subDays(addYears(start, 1), 1)
}

module.exports = {
  normalizeOrganisationCode,
  startOfStudyYear,
  endOfStudyYear,
}
