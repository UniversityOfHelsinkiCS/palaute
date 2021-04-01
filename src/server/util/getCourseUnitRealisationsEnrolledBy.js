const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const { CourseRealisation } = require('../models')
const { Question } = require('../models')

const defaultQuestions = require('./questions.json')

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

const createCourseRealisation = async (data) => {
  const [course, _] = await CourseRealisation.upsert({
    id: data.id,
    endDate: data.activityPeriod.endDate,
    name: data.name,
  })
  const [question, created] = await Question.findOrCreate({
    where: {
      courseRealisationId: data.id,
    },
    defaults: {
      courseRealisationId: data.id,
      data: defaultQuestions,
    }
  })
  return course
}

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
  return await Promise.all(
    data.map(async (course) => await createCourseRealisation(course)),
  )
}

module.exports = getCourseUnitRealisationsEnrolledBy
