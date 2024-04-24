const { Router } = require('express')
const { getTeacherCourseUnits } = require('../../services/myTeaching/myTeachingService')
const { getMyTeachingTabCounts } = require('../../services/myTeaching/tabCountService')

const getCourseUnitsForTeacher = async (req, res) => {
  const { query, user } = req

  const courseUnits = await getTeacherCourseUnits(user, query)

  res.send(courseUnits)
}

const getTabCounts = async (req, res) => {
  const { user } = req

  const tabCounts = await getMyTeachingTabCounts(user)

  res.send(tabCounts)
}

const router = Router()

router.get('/courses', getCourseUnitsForTeacher)
router.get('/tab-counts', getTabCounts)

module.exports = router
