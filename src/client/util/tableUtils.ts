type SortableRow = {
  activityPeriod?: Record<string, unknown>
  [key: string]: unknown
}

const descendingComparator = <T extends SortableRow>(a: T, b: T, orderBy: string) => {
  if (orderBy === 'startDate' || orderBy === 'endDate') {
    const aDates = a.activityPeriod
    const bDates = b.activityPeriod

    if (aDates[orderBy] < bDates[orderBy]) {
      return -1
    }
    if (aDates[orderBy] > bDates[orderBy]) {
      return 1
    }
    return 0
  }
  if (a[orderBy] < b[orderBy]) {
    return -1
  }
  if (a[orderBy] > b[orderBy]) {
    return 1
  }
  return 0
}

const getComparator = <T extends SortableRow>(order: 'asc' | 'desc', orderBy: string) => {
  const comparator =
    order === 'desc'
      ? (a: T, b: T) => descendingComparator(a, b, orderBy)
      : (a: T, b: T) => -descendingComparator(a, b, orderBy)
  return comparator
}

export const sortTable = <T extends SortableRow>(array: T[], order: 'asc' | 'desc', orderBy: string): T[] => {
  const stabilizedArray = array.map((object, index): [T, number] => [object, index])
  const comparator = getComparator<T>(order, orderBy)
  stabilizedArray.sort((a, b) => {
    const cmp = comparator(a[0], b[0])
    if (cmp !== 0) return cmp
    return a[1] - b[1]
  })
  return stabilizedArray.map(pair => pair[0])
}
