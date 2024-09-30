type DateGroup<T> = [string, [string, [string, T[]][]][]]

export class FeedbackTargetGrouping {
  years: DateGroup<any>[]

  constructor(yearGroupedFeedbackTargets: DateGroup<any>[]) {
    this.years = yearGroupedFeedbackTargets ?? []
  }

  filter(fn: (fbt: any) => boolean) {
    const filtered = this.years
      .map(([yd, months]) => [
        yd,
        months
          .map(([md, days]) => [
            md,
            days.map(([dd, fbts]) => [dd, fbts.filter(fn)]).filter(([, fbts]) => fbts.length > 0),
          ])
          .filter(([, days]) => days.length > 0),
      ])
      .filter(([, months]) => months.length > 0)

    return new FeedbackTargetGrouping(filtered as DateGroup<any>[])
  }

  flatMap<T>(fn: (fbt: any) => T) {
    const mapFn = typeof fn === 'function' ? fn : (x: T) => x
    const mapped = [] as T[]
    this.forEach(fbt => mapped.push(mapFn(fbt)))
    return mapped
  }

  forEach(fn: (fbt: any) => void) {
    for (const year of this.years) {
      for (const month of year[1]) {
        for (const day of month[1]) {
          for (const fbt of day[1]) {
            fn(fbt)
          }
        }
      }
    }
  }
}
