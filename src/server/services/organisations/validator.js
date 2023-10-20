const { Op } = require('sequelize')
const { User } = require('../../models')

const validateStudentNumbers = async studentNumbers => {
  const existingStudentNumbers = await User.findAll({
    where: {
      studentNumber: { [Op.in]: studentNumbers },
    },
    attributes: ['studentNumber'],
  }).map(({ studentNumber }) => studentNumber)

  const nonExistingStudentNumbers = studentNumbers.filter(
    studentNumber => !existingStudentNumbers.includes(studentNumber)
  )

  return {
    validStudentNumbers: existingStudentNumbers,
    invalidStudentNumbers: nonExistingStudentNumbers,
  }
}

module.exports = {
  validateStudentNumbers,
}
