import { parseISO, format } from 'date-fns'

export const getCoursePeriod = (courseRealisation) => {
  const startDate = format(parseISO(courseRealisation.startDate), 'dd.MM.yyyy')
  const endDate = format(parseISO(courseRealisation.endDate), 'dd.MM.yyyy')

  return `${startDate} - ${endDate}`
}
