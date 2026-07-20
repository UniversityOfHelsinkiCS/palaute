export const startOfStudyYear = (date: Date | string | number): Date => {
  // Year starting month
  const MONTH = 8

  const d: Date = typeof date !== 'object' ? new Date(date) : date

  const year = d.getFullYear() - (d.getMonth() + 1 < MONTH ? 1 : 0)

  return new Date(`${year}-0${MONTH}-01`)
}
