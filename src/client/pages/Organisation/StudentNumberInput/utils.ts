import { ADD_LEADING_ZERO_TO_STUDENT_NUMBERS } from '../../../util/common'

// Splitting on any whitespace also drops the \r and tabs that come along when pasting from a spreadsheet
export const splitStudentNumbers = (text: string) => text.split(/[\s,;]/)

const STUDENT_NUMBER_LENGTH = 9

// Spreadsheets drop the leading zeros of student numbers, so they are put back. Only digits are padded,
// so that the user still recognises a mistyped student number in the validation error.
export const normaliseStudentNumbers = (studentNumbers: string[]) =>
  studentNumbers
    .map(studentNumber => studentNumber.trim())
    .filter(studentNumber => studentNumber)
    .map(studentNumber =>
      ADD_LEADING_ZERO_TO_STUDENT_NUMBERS && /^\d+$/.test(studentNumber)
        ? studentNumber.padStart(STUDENT_NUMBER_LENGTH, '0')
        : studentNumber
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
