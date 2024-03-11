const { Router } = require('express')
const { getTeacherCourseUnits } = require('../../services/myTeaching/myTeachingService')

const getCourseUnitsForTeacher = async (req, res) => {
  const { query, user } = req

  const courseUnits = await getTeacherCourseUnits(user, query)

  res.send(courseUnits)
}

const router = Router()

router.get('/courses', getCourseUnitsForTeacher)

module.exports = router
