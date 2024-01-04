import _ from 'lodash'
import { addYears, subDays } from 'date-fns'
import { startOfStudyYear } from './startOfStudyYear'
import { STUDY_YEAR_START_MONTH } from './common'

export const getStudyYearRange = date => {
  const start = startOfStudyYear(date)
  const end = subDays(addYears(start, 1), 1)

  return {
    start,
    end,
  }
}

export const useYearSemesters = currentStart => {
  const now = new Date()
  const year = Math.min(currentStart.getFullYear(), startOfStudyYear(now).getFullYear())

  let semesters = _.range(2021, now.getFullYear() + 1)
    .flatMap(year => [
      {
        start: new Date(`${year}-01-01`),
        end: subDays(new Date(`${year}-0${STUDY_YEAR_START_MONTH}-01`), 1),
      },
      {
        start: new Date(`${year}-0${STUDY_YEAR_START_MONTH}-01`),
        end: subDays(new Date(`${year + 1}-01-01`), 1),
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
