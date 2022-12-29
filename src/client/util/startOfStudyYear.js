/**
 *
 * @param {Date | string | number} date
 * @return {Date} first day of study year
 */
export const startOfStudyYear = (date) => {
  // Year starting month
  const MONTH = 8

  let d = null
  if (typeof date !== 'object') {
    d = new Date(date)
  } else {
    d = date
  }

  const year = d.getFullYear() - (d.getMonth() + 1 < MONTH ? 1 : 0)

  return new Date(`${year}-${MONTH}-01`)
}
