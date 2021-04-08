const importerClient = require('./importerClient')

const { CourseRealisation } = require('../models')
const { Question } = require('../models')

const defaultQuestions = require('./questions.json')

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

const getEnrollmentByPersonId = async (personId) => {
  const { data } = await importerClient.get(`/palaute/enrolled/${personId}`)

  return Promise.all(
    data.map(async (enrollment) =>
      createCourseRealisation(enrollment.course_unit_realisation),
    ),
  )
}

module.exports = {
  getEnrollmentByPersonId,
}
