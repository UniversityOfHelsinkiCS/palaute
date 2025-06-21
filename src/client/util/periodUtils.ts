import { Period, getPeriods } from '../../common/studyPeriods'
import { getSemesterRange } from './semesterUtils'
import { getYearRange } from './yearUtils'

export const usePeriods = (
  selectedStart = new Date(),
  reset = true,
  semesterReset = true
): { periods: Period[]; selectedPeriod: Period } => {
  const semester = getSemesterRange(selectedStart)
  const year = getYearRange(selectedStart)

  const periods = semesterReset ? getPeriods(year.start, year.end) : getPeriods(semester.start, semester.end)

  const noSelection = {
    start: semesterReset ? year.start : semester.start,
    end: semesterReset ? year.end : semester.end,
    name: 'not selected',
  }

  periods.unshift(noSelection)

  const selectedPeriod = reset ? periods[0] : periods.slice(1).find(p => p.start <= selectedStart) || periods[0]

  return {
    periods,
    selectedPeriod,
  }
}
