import { format, parseISO } from 'date-fns'

export const getDateRangeString = (startDate: string | Date, endDate: string | Date) => {
  if (typeof startDate === 'string') {
    startDate = parseISO(startDate)
  }
  if (typeof endDate === 'string') {
    endDate = parseISO(endDate)
  }

  const differentYears = startDate.getFullYear() !== endDate.getFullYear()

  const startDateString = format(startDate, differentYears ? 'd.M.yyyy' : 'd.M.')
  const endDateString = format(endDate, 'd.M.yyyy')

  return `${startDateString}–${endDateString}`
}

export const getStartAndEndString = (startDate: string | Date, endDate: string | Date) => {
  if (typeof startDate === 'string') {
    startDate = parseISO(startDate)
  }
  if (typeof endDate === 'string') {
    endDate = parseISO(endDate)
  }

  const differentYears = startDate.getFullYear() !== endDate.getFullYear()

  const startDateString = format(startDate, differentYears ? 'd.M.yyyy' : 'd.M.')
  const endDateString = format(endDate, 'd.M.yyyy')

  return [startDateString, endDateString]
}
