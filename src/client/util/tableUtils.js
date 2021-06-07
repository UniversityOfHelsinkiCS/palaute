const descendingComparator = (a, b, orderBy) => {
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

const getComparator = (order, orderBy) => {
  const comparator =
    order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy)
  return comparator
}

export const sortTable = (array, order, orderBy) => {
  const stabilizedArray = array.map((object, index) => [object, index])
  const comparator = getComparator(order, orderBy)
  stabilizedArray.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedArray.map((array) => array[0])
}
