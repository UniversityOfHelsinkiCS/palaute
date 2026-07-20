import { format, isValid } from 'date-fns'

const formatDate = (date?: Date | string | number, dateFormat = 'dd.MM.yyyy') => {
  if (!date) {
    return undefined
  }

  const normalizedDate = new Date(date)

  if (!isValid(normalizedDate)) {
    return undefined
  }

  return format(normalizedDate, dateFormat)
}

export default formatDate
