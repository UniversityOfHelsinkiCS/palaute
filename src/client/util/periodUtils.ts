import { Period, getPeriodsUntil } from '../../common/studyPeriods'

export const usePeriods = (selectedStart: Date, futureYears = 0): { periods: Period[]; selectedPeriod: Period } => {
  const now = new Date()
  const until = futureYears > 0 ? new Date(new Date().setFullYear(now.getFullYear() + futureYears)) : now

  const periods = getPeriodsUntil(until)

  const selectedPeriod = periods.find(p => p.start <= selectedStart) || periods[0]

  return {
    periods,
    selectedPeriod,
  }
}
