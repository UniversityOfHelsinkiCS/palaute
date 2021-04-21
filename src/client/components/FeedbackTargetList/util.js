import { format, parseISO } from 'date-fns'

export const parseDate = (date) => {
  const parsed = format(parseISO(date), 'd.M.yyyy')
  return parsed
}
