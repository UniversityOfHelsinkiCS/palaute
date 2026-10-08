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

  const existingStudentNumberSet = new Set(existingStudentNumbers)
  const nonExistingStudentNumbers = studentNumbers.filter(studentNumber => !existingStudentNumberSet.has(studentNumber))

  return {
    validStudentNumbers: existingStudentNumbers,
    invalidStudentNumbers: nonExistingStudentNumbers,
  }
}
