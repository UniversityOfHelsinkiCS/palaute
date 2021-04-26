const { ApplicationError } = require('../util/customErrors')
const { CourseUnit } = require('../models')

const getOne = async (req, res) => {
  const { code } = req.params

  const courseUnit = await CourseUnit.findOne({
    where: {
      courseCode: code,
    },
  })

  if (!courseUnit) throw new ApplicationError('Not found', 404)

  res.send(courseUnit)
}

module.exports = {
  getOne,
}
