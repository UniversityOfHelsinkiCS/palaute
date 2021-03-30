const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

const getCourseUnitRealisationsEnrolledBy = async (username, options = {}) => {
  const { startDateBefore, endDateAfter } = options

  const params = {
    ...(startDateBefore && { startDateBefore: formatDate(startDateBefore) }),
    ...(endDateAfter && { endDateAfter: formatDate(endDateAfter) }),
  }

  const {
    data,
  } = await importerClient.get(
    `/palaute/course_unit_realisations/enrolled/${username}`,
    { params },
  )

  return data
}

module.exports = getCourseUnitRealisationsEnrolledBy
