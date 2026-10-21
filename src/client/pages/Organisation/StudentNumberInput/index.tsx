import type { User } from '@common/types/user'
import type { ReactNode } from 'react'

import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material'
import { useFormikContext } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'

import type { InitialValues } from '../CourseSearchInput'

import { NorButton } from '../../../components/common/NorButton'
import RemoveStudentNumbersDialog from './RemoveStudentNumbersDialog'
import ShowAllStudentsToggle from './ShowAllStudentsToggle'
import StudentNumberInputInfo from './StudentNumberInputInfo'
import { useStudentNumberRemoval } from './useStudentNumberRemoval'
import { canHideStudentNumbers, getVisibleStudentNumbers, normaliseStudentNumbers, splitStudentNumbers } from './utils'

const REMOVE_ERROR_STUDENT_NUMBERS_LABELS = {
  invalid: 'organisationSurveys:removeInvalidStudentNumbers',
  overlap: 'organisationSurveys:removeResponsiblePersonStudentNumbers',
}

// The user search returns the responsible teachers with their student numbers
type Teacher = User & { studentNumber?: string | null }

// Built by getInvalidStudentNumbersError and getOverlappingStudentTeachersError in ../utils
type StudentNumbersError = {
  text: string
  data: string[]
  kind: keyof typeof REMOVE_ERROR_STUDENT_NUMBERS_LABELS
}

type StudentNumberInputProps = {
  name: string
  title: ReactNode
  editView?: boolean
}

const StudentNumberInput = ({ name, title, editView = false }: StudentNumberInputProps) => {
  const { t } = useTranslation()
  const formikProps = useFormikContext<InitialValues>()
  const [value, setValue] = React.useState<string[]>(formikProps.initialValues[name])
  const [inputValue, setInputValue] = React.useState('')
  const [showAllStudentNumbers, setShowAllStudentNumbers] = React.useState(false)

  // Submit errors are kept in status, because Formik's validation replaces the whole errors object
  const error: StudentNumbersError | undefined = formikProps.status?.[name]
  const errorText = error?.text
  const errorData = error?.data
  const errorKind = error?.kind
  const teachers: Teacher[] = formikProps.values.teachers

  // Numbers the user has fixed some other way, by removing the chip or the responsible person, are no longer errors
  const errorStudentNumbers = React.useMemo(() => {
    const studentNumbers = new Set(value)
    const teacherStudentNumbers = new Set(teachers.map(teacher => teacher.studentNumber))

    return new Set<string>(
      errorData?.filter(
        studentNumber =>
          studentNumbers.has(studentNumber) && (errorKind !== 'overlap' || teacherStudentNumbers.has(studentNumber))
      )
    )
  }, [errorData, errorKind, value, teachers])

  const hasError = errorStudentNumbers.size > 0
  const removeButtonLabelKey = REMOVE_ERROR_STUDENT_NUMBERS_LABELS[errorKind]
  const inputRef = React.useRef<HTMLInputElement>(null)
  const removeButtonRef = React.useRef<HTMLButtonElement>(null)

  // Each save that finds erroneous student numbers sets a new error object, so focus moves on every such save
  React.useEffect(() => {
    if (error) removeButtonRef.current?.focus()
  }, [error])

  const updateStudentNumbers = (studentNumbers: string[]) => {
    setValue(studentNumbers)
    formikProps.setFieldValue(name, studentNumbers)
  }

  const removeErrorStudentNumbers = () => {
    updateStudentNumbers(value.filter(v => !errorStudentNumbers.has(v)))
    formikProps.setStatus({ ...formikProps.status, [name]: undefined })
    inputRef.current?.focus()
  }

  const { requestRemoval, dialogProps } = useStudentNumberRemoval(removal => {
    if (removal.kind === 'chip') {
      updateStudentNumbers(removal.studentNumbers)
      inputRef.current?.focus()
    } else {
      removeErrorStudentNumbers()
    }
  })

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {title}
      </Typography>

      <StudentNumberInputInfo />

      <Autocomplete<string, true, false, true>
        data-cy="formik-student-number-input-field"
        id={name}
        multiple
        fullWidth
        clearOnBlur
        options={[]}
        freeSolo
        value={value}
        inputValue={inputValue}
        onChange={(event, studentNumbers, reason, detail) => {
          let newStudentNumbers = studentNumbers
          let removedStudentNumber = detail?.option

          // Autocomplete removes the chip it has focused with the arrow keys, or else the last chip. A screen reader
          // can move focus to a chip without Autocomplete knowing, so remove the chip the key press came from instead
          const chip = reason === 'removeOption' && (event.target as Element).closest<HTMLElement>('[data-tag-index]')
          if (chip) {
            const chipIndex = Number(chip.dataset.tagIndex)
            removedStudentNumber = value[chipIndex]
            newStudentNumbers = value.filter((_, index) => index !== chipIndex)
          }

          if (editView && reason === 'removeOption') {
            requestRemoval({ kind: 'chip', studentNumber: removedStudentNumber, studentNumbers: newStudentNumbers })
            return
          }

          updateStudentNumbers(newStudentNumbers)
        }}
        onInputChange={(_, newInputValue) => {
          const parts = splitStudentNumbers(newInputValue)
          if (parts.length > 1) {
            updateStudentNumbers(normaliseStudentNumbers(value.concat(parts)))
            setInputValue('')
          } else {
            setInputValue(newInputValue)
          }
        }}
        renderTags={(studentNumbers, getTagProps) => {
          const { visible, firstEndIndex, hasHidden } = getVisibleStudentNumbers({
            studentNumbers,
            showAll: showAllStudentNumbers,
            alwaysVisible: errorStudentNumbers,
          })

          const ellipsis = hasHidden && (
            <Typography key="ellipsis" component="span" variant="body2" aria-hidden sx={{ mx: 1 }}>
              …
            </Typography>
          )

          return visible.flatMap(({ studentNumber, index }) => [
            index === firstEndIndex && ellipsis,
            <Chip
              {...getTagProps({ index })}
              data-cy={`formik-student-number-input-field-chip-${studentNumber}`}
              key={`${studentNumber}-${index}`}
              variant="outlined"
              label={studentNumber}
              color={errorStudentNumbers.has(studentNumber) ? 'error' : 'primary'}
            />,
          ])
        }}
        renderInput={params => (
          <TextField
            label={t('organisationSurveys:students')}
            {...params}
            inputRef={inputRef}
            error={hasError}
            helperText={hasError ? errorText : ''}
            slotProps={{
              formHelperText: {
                role: hasError ? 'alert' : undefined,
              },
            }}
          />
        )}
      />

      {hasError && removeButtonLabelKey && (
        <NorButton
          ref={removeButtonRef}
          data-cy="formik-student-number-input-remove-erroneous"
          color="cancel"
          type="button"
          onClick={editView ? () => requestRemoval({ kind: 'errors' }) : removeErrorStudentNumbers}
          sx={{ mt: 1 }}
        >
          {t(removeButtonLabelKey)}
        </NorButton>
      )}

      <RemoveStudentNumbersDialog {...dialogProps} errorStudentNumbers={errorStudentNumbers} />

      {canHideStudentNumbers(value) && (
        <ShowAllStudentsToggle
          count={value.length}
          showAll={showAllStudentNumbers}
          onShowAllChange={setShowAllStudentNumbers}
        />
      )}
    </Box>
  )
}

export default StudentNumberInput
