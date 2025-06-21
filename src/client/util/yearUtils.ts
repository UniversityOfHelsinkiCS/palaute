import { addYears, subYears, subDays } from 'date-fns'
import { startOfStudyYear } from './startOfStudyYear'
import { STUDY_YEAR_START_MONTH } from './common'

type Year = {
  start: Date
  end: Date
}

export const getYearRange = (date = new Date()) => {
  const start = startOfStudyYear(date)
  const end = subDays(addYears(start, 1), 1)

  return {
    start,
    end,
  }
}

export const useAcademicYears = (
  selectedStart = new Date(),
  futureYears = 0
): { academicYears: Year[]; selectedYear: Year } => {
  const academicYears = []
  const now = new Date()
  const until = futureYears > 0 ? new Date(new Date().setFullYear(now.getFullYear() + futureYears)) : now

  for (let date = until; date >= new Date(`2020-0${STUDY_YEAR_START_MONTH}-01`); ) {
    academicYears.push(getYearRange(date))
    date = subYears(date, 1)
  }

  const selectedYear = academicYears.find(y => y.start <= selectedStart) || academicYears[0]

  return {
    academicYears,
    selectedYear,
  }
}

export const getYearDisplayName = (year: Year) => {
  const displayName = `${year.start.getFullYear()}–${year.end.getFullYear()}`

  return displayName
}
