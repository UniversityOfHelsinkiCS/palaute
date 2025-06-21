import { addYears, subDays } from 'date-fns'
import { startOfStudyYear } from './startOfStudyYear'
import { getYearRange } from './yearUtils'
import { STUDY_YEAR_START_MONTH } from './common'

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

type Season = 'spring' | 'fall' | 'both'

type Semester = {
  start: Date
  end: Date
  season: Season
}

export const useSemesters = (
  selectedStart = new Date(),
  reset = true
): { semesters: Semester[]; selectedSemester: Semester } => {
  const bothSeasons = getYearRange(selectedStart)
  const startYear = bothSeasons.start.getFullYear()
  const semesters = [
    {
      start: bothSeasons.start,
      end: bothSeasons.end,
      season: 'both' as Season,
    },
    {
      start: new Date(`${startYear + 1}-01-01`),
      end: subDays(new Date(`${startYear + 1}-0${STUDY_YEAR_START_MONTH}-01`), 1),
      season: 'spring' as Season,
    },
  ]

  if (startYear > 2020) {
    semesters.push({
      start: new Date(`${startYear}-0${STUDY_YEAR_START_MONTH}-01`),
      end: subDays(new Date(`${startYear + 1}-01-01`), 1),
      season: 'fall' as Season,
    })
  }

  const selectedSemester = reset ? semesters[0] : semesters.slice(1).find(s => s.start <= selectedStart) || semesters[0]

  return {
    semesters,
    selectedSemester,
  }
}
