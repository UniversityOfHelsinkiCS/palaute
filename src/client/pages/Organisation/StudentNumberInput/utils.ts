import { ADD_LEADING_ZERO_TO_STUDENT_NUMBERS } from '../../../util/common'

export const splitStudentNumbers = (text: string) => text.split(/[,\n; ]/)

export const normaliseStudentNumbers = (studentNumbers: string[]) =>
  studentNumbers
    .filter(studentNumber => studentNumber)
    .map(studentNumber =>
      studentNumber.length < 9 && ADD_LEADING_ZERO_TO_STUDENT_NUMBERS ? `0${studentNumber}` : studentNumber
    )

const VISIBLE_STUDENT_NUMBERS_AT_START = 250
const VISIBLE_STUDENT_NUMBERS_AT_END = 250

export const canHideStudentNumbers = (studentNumbers: string[]) =>
  studentNumbers.length > VISIBLE_STUDENT_NUMBERS_AT_START + VISIBLE_STUDENT_NUMBERS_AT_END

type GetVisibleStudentNumbersOptions = {
  studentNumbers: string[]
  showAll: boolean
  alwaysVisible: Set<string>
}

// Shows the first and the last student numbers (the last ones so that Backspace removes a visible one),
// and always the ones in alwaysVisible. The ellipsis for the hidden ones goes before firstEndIndex.
export const getVisibleStudentNumbers = ({
  studentNumbers,
  showAll,
  alwaysVisible,
}: GetVisibleStudentNumbersOptions) => {
  const firstEndIndex = studentNumbers.length - VISIBLE_STUDENT_NUMBERS_AT_END
  const visible = studentNumbers
    .map((studentNumber, index) => ({ studentNumber, index }))
    .filter(
      ({ studentNumber, index }) =>
        showAll ||
        index < VISIBLE_STUDENT_NUMBERS_AT_START ||
        index >= firstEndIndex ||
        alwaysVisible.has(studentNumber)
    )

  return { visible, firstEndIndex, hasHidden: visible.length < studentNumbers.length }
}
