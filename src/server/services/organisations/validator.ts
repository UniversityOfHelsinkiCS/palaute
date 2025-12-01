import { Op } from 'sequelize'
import { User } from '../../models'

export const validateStudentNumbers = async (studentNumbers: string[]) => {
  const existingStudentNumbers = (
    await User.findAll({
      where: {
        studentNumber: { [Op.in]: studentNumbers },
      },
      attributes: ['studentNumber'],
    })
  ).map(({ studentNumber }) => studentNumber)

  const nonExistingStudentNumbers = studentNumbers.filter(
    studentNumber => !existingStudentNumbers.includes(studentNumber)
  )

  return {
    validStudentNumbers: existingStudentNumbers,
    invalidStudentNumbers: nonExistingStudentNumbers,
  }
}
