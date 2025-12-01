import { addYears, subDays, startOfDay, endOfDay } from 'date-fns'
import { parseFromTimeZone } from 'date-fns-timezone'

const isNumber = (value: string) => !Number.isNaN(parseInt(value, 10))

export const normalizeOrganisationCode = (r: string) => {
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
export const startOfStudyYear = (date: Date | string | number) => {
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
export const endOfStudyYear = (date: Date | string | number) => {
  const start = startOfStudyYear(date)
  return subDays(addYears(start, 1), 1)
}

const parseDate = (d: Date | string | number) =>
  parseFromTimeZone(new Date(d) as unknown as string, { timeZone: 'Europe/Helsinki' })

export interface DateRangeInput {
  startDate: Date | string | number
  endDate: Date | string | number
}

export const formatActivityPeriod = ({ startDate, endDate }: DateRangeInput) => {
  if (!startDate || !endDate) return null

  return {
    startDate: startOfDay(parseDate(startDate)),
    endDate: endOfDay(parseDate(endDate)),
  }
}

/**
 * Transform tagId to the prefixed format used in summaries entityIds.
 * This is for avoiding conflicts with other entityIds that may come from external APIs.
 * @param {number} tagId - the original tagId
 * @returns {string} the prefixed tagId, e.g. 'norppa-tag-1234'
 */
export const prefixTagId = (tagId: number | string) => `norppa-tag-${tagId}`
