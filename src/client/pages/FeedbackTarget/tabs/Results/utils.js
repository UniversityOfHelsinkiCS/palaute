import { format, parseISO } from 'date-fns'

export const getCourseStartDate = feedbackTarget =>
  format(parseISO(feedbackTarget.courseRealisation.startDate), 'yyyy-MM-dd')

export const sortGroups = ({ name: nameA }, { name: nameB }) => {
  // Helper function to check if a string contains any numbers
  const containsNumber = str => /\d/.test(str)

  // Prioritize strings without numbers in the comparison
  if (!containsNumber(nameA) && containsNumber(nameB)) {
    return -1 // nameA comes first
  }
  if (containsNumber(nameA) && !containsNumber(nameB)) {
    return 1 // nameB comes first
  }

  // Helper function for natural comparison of alphanumeric strings
  // https://stackoverflow.com/questions/15478954/sort-array-elements-string-with-numbers-natural-sort
  const naturalCompare = (a, b) => {
    const ax = []
    const bx = []

    // Split the strings into numeric and non-numeric parts
    a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
      ax.push([$1 || Infinity, $2 || ''])
    })

    b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
      bx.push([$1 || Infinity, $2 || ''])
    })

    // Compare the parts of the strings
    while (ax.length && bx.length) {
      const an = ax.shift()
      const bn = bx.shift()
      const nn = an[0] - bn[0] || an[1].localeCompare(bn[1])
      if (nn) return nn
    }

    return ax.length - bx.length // Handle remaining parts
  }

  // Perform the natural comparison on the name strings
  return naturalCompare(nameA, nameB)
}
