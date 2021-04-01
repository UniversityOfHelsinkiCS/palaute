const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const { CourseRealisation } = require('../models')
const { Question } = require('../models')

const defaultQuestions = require('./questions.json')

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

const createCourseRealisation = async (data) => {
  const [course] = await CourseRealisation.upsert({
    id: data.id,
    endDate: data.activityPeriod.endDate,
    name: data.name,
  })
  await Question.findOrCreate({
    where: {
      courseRealisationId: data.id,
    },
    defaults: {
      courseRealisationId: data.id,
      data: defaultQuestions,
    },
  })
  return course
}

const getCourseUnitRealisationsWhereResponsible = async (username) => {
  const { data } = await importerClient.get(
    `/palaute/course_unit_realisations/responsible/${username}`,
  )



  return Promise.all(
    data
      .map((course) => ({ ...course, activityPeriod: course.activity_period}))
      .map(async (course) => createCourseRealisation(course)),
  )
}

const getCourseUnitRealisationById = async (courseUnitRealisationId) => {
  const { data } = await importerClient.get(
    `/course_unit_realisations/${courseUnitRealisationId}`,
  )

  return await createCourseRealisation(data)
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
  return Promise.all(
    data.map(async (course) => createCourseRealisation(course)),
  )
}

module.exports = {
  getCourseUnitRealisationsWhereResponsible,
  getCourseUnitRealisationById,
  getCourseUnitRealisationsEnrolledBy,
}
