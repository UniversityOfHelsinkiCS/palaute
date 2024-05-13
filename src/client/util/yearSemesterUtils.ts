import { range } from 'lodash-es'
import { addYears, subDays } from 'date-fns'
import { startOfStudyYear } from './startOfStudyYear'
import { STUDY_YEAR_START_MONTH } from './common'

export const getStudyYearRange = (date = new Date()) => {
  const start = startOfStudyYear(date)
  const end = subDays(addYears(start, 1), 1)

  return {
    start,
    end,
  }
}

export const getSemesterRange = (date = new Date()) => {
  const start = startOfStudyYear(date)
  const end = subDays(addYears(start, 1), 1)
  const middle = new Date(`${end.getFullYear()}-01-01`)
  const spring = date >= middle

  if (spring) {
    return {
      start: middle,
      end,
    }
  }

  return {
    start,
    end: subDays(middle, 1),
  }
}

type Semester = { start: Date; end: Date; spring: boolean }

export const useYearSemesters = (currentStart: Date, futureYears = 0) => {
  const now = new Date()
  const year = Math.min(currentStart.getFullYear(), startOfStudyYear(now).getFullYear())

  let semesters: Semester[] = range(2021, now.getFullYear() + 1 + futureYears)
    .flatMap((yr: number) => [
      {
        start: new Date(`${yr}-01-01`),
        end: subDays(new Date(`${yr}-0${STUDY_YEAR_START_MONTH}-01`), 1),
      },
      {
        start: new Date(`${yr}-0${STUDY_YEAR_START_MONTH}-01`),
        end: subDays(new Date(`${yr + 1}-01-01`), 1),
      },
    ])
    .map((s, i) => ({ ...s, spring: i % 2 === 0 }))
    .reverse()
  semesters = now.getMonth() + 1 < STUDY_YEAR_START_MONTH ? semesters.slice(1) : semesters

  const currentSemester = semesters.find(s => s.start <= currentStart) || semesters.find(s => s.start <= now)

  return {
    year,
    semesters,
    currentSemester,
  }
}
