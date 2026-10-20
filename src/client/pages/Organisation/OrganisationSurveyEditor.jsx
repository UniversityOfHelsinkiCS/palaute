import { ExpandMore, WarningAmber } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Chip,
  Box,
  CircularProgress,
  Dialog,
  Grid2 as Grid,
  Typography,
  TextField,
  DialogTitle,
} from '@mui/material'
import { useFormikContext, Form, Formik } from 'formik'
import { debounce } from 'lodash-es'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '../../components/common/ConfirmDialog'
import FormikDatePicker from '../../components/common/FormikDatePicker'
import FormikLocalesFieldEditor from '../../components/common/FormikLocalesFieldEditor'
import Instructions from '../../components/common/Instructions'
import { NorButton } from '../../components/common/NorButton'
import { focusIndicatorStyle } from '../../util/accessibility'
import apiClient from '../../util/apiClient'
import { ADD_LEADING_ZERO_TO_STUDENT_NUMBERS } from '../../util/common'
import CourseSearchInput from './CourseSearchInput'

const ResponsibleTeachersSelector = ({ name, title, ...props }) => {
  const { t } = useTranslation()
  const formikProps = useFormikContext()
  const [potentialUsers, setPotentialUsers] = useState([])

  const hasError = formikProps.touched[name] && formikProps.errors[name]
  const errorText = formikProps.errors[name]

  const handleChange = debounce(async ({ target }) => {
    const query = target.value
    if (query.length < 5) return

    const params = {
      user: query,
    }

    const { data } = await apiClient.get('/users', { params })
    const { persons } = data

    setPotentialUsers(persons)
  }, 1000)

  return (
    <Box>
      <Typography variant="body1" mb={2}>
        {title}
      </Typography>

      <Autocomplete
        {...props}
        data-cy="formik-responsible-teacher-input"
        id={name}
        name={name}
        multiple
        fullWidth
        value={formikProps.values.teachers}
        onChange={(_, teachers) => formikProps.setFieldValue('teachers', teachers)}
        onBlur={formikProps.handleBlur}
        options={potentialUsers}
        getOptionDisabled={option => formikProps.values.teachers.some(v => v.id === option.id)}
        onInputChange={handleChange}
        getOptionLabel={option => `${option.firstName} ${option.lastName} (${option.email})`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        autoHighlight
        slotProps={{
          chip: {
            'data-cy': `formik-responsible-teacher-input-field-chip`,
          },
        }}
        renderInput={params => (
          <TextField
            {...params}
            slotProps={{
              htmlInput: {
                ...params.inputProps,
                'data-cy': 'formik-responsible-teacher-input-field',
              },
              formHelperText: {
                role: hasError ? 'alert' : undefined,
              },
            }}
            label={t('organisationSurveys:responsibleTeachers')}
            error={Boolean(hasError)}
            helperText={hasError ? errorText : ''}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            {`${option.firstName} ${option.lastName} (${option.email})`}
          </li>
        )}
      />
    </Box>
  )
}

const StudenNumberInputInfo = () => {
  const { t } = useTranslation()

  return (
    <Instructions title={t('organisationSurveys:studentNumberInformation')} dataCyPrefix="formik-student-number-input">
      <ul>
        <li>{t('organisationSurveys:studentNumberDelimeters:comma')}</li>
        <li>{t('organisationSurveys:studentNumberDelimeters:semicolon')}</li>
        <li>{t('organisationSurveys:studentNumberDelimeters:space')}</li>
        <li>{t('organisationSurveys:studentNumberDelimeters:newline')}</li>
      </ul>
      <Typography variant="body2" mt={2}>
        {t('organisationSurveys:studentNumberExampleInput')}
      </Typography>
      <Box
        data-cy="formik-student-number-input-example"
        sx={{ background: 'white', maxWidth: 480, p: 1, border: 1, borderRadius: 1 }}
        component="pre"
      >
        010000003;
        <br />
        011000002,
        <br />
        011000090 011000003
      </Box>
    </Instructions>
  )
}

const VISIBLE_STUDENT_NUMBERS_AT_START = 250
const VISIBLE_STUDENT_NUMBERS_AT_END = 250

// Kept separate from StudentNumberInput so that the pending state renders without re-rendering all the chips
const ShowAllStudentsToggle = ({ count, showAll, onShowAllChange }) => {
  const { t } = useTranslation()
  const [isPending, startTransition] = React.useTransition()
  const [nextShowAll, setNextShowAll] = React.useState(showAll)

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2, rowGap: 1, mt: 1 }}>
      <NorButton
        data-cy="formik-student-number-input-show-all"
        color={nextShowAll ? 'secondary' : 'warning'}
        icon={!nextShowAll && <WarningAmber />}
        type="button"
        onClick={() => {
          const next = !nextShowAll
          setNextShowAll(next)
          startTransition(() => onShowAllChange(next))
        }}
      >
        {nextShowAll ? t('organisationSurveys:showFewerStudents') : t('organisationSurveys:showAllStudents', { count })}
      </NorButton>

      {/* Always rendered so that screen readers announce changes to its content */}
      <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 24 }}>
        {isPending && (
          <>
            <CircularProgress size={16} aria-hidden />
            <Typography variant="body2">
              {nextShowAll
                ? t('organisationSurveys:expandingStudentList')
                : t('organisationSurveys:collapsingStudentList')}
            </Typography>
          </>
        )}
        {!isPending && showAll && (
          <Typography variant="body2">{t('organisationSurveys:allStudentsShown', { count })}</Typography>
        )}
      </Box>
    </Box>
  )
}

const REMOVE_ERROR_STUDENT_NUMBERS_LABELS = {
  invalid: 'organisationSurveys:removeInvalidStudentNumbers',
  overlap: 'organisationSurveys:removeResponsiblePersonStudentNumbers',
}

const StudentNumberInput = ({ name, title, editView = false, ...props }) => {
  const { t } = useTranslation()
  const formikProps = useFormikContext()
  const [value, setValue] = React.useState(formikProps.initialValues[name])
  const [inputValue, setInputValue] = React.useState('')
  const [showAllStudentNumbers, setShowAllStudentNumbers] = React.useState(false)
  const canHideStudentNumbers = value.length > VISIBLE_STUDENT_NUMBERS_AT_START + VISIBLE_STUDENT_NUMBERS_AT_END

  // Submit errors are kept in status, because Formik's validation replaces the whole errors object
  const error = formikProps.status?.[name]
  const errorText = error?.text
  const errorData = error?.data
  const errorKind = error?.kind
  const { teachers } = formikProps.values

  // Numbers the user has fixed some other way, by removing the chip or the responsible person, are no longer errors
  const errorStudentNumbers = React.useMemo(() => {
    const studentNumbers = new Set(value)
    const teacherStudentNumbers = new Set(teachers.map(teacher => teacher.studentNumber))

    return new Set(
      errorData?.filter(
        studentNumber =>
          studentNumbers.has(studentNumber) && (errorKind !== 'overlap' || teacherStudentNumbers.has(studentNumber))
      )
    )
  }, [errorData, errorKind, value, teachers])

  const hasError = errorStudentNumbers.size > 0
  const removeButtonLabelKey = REMOVE_ERROR_STUDENT_NUMBERS_LABELS[errorKind]
  const inputRef = React.useRef(null)
  const removeButtonRef = React.useRef(null)

  // Each save that finds erroneous student numbers sets a new error object, so focus moves on every such save
  React.useEffect(() => {
    if (error) removeButtonRef.current?.focus()
  }, [error])

  const removeErrorStudentNumbers = () => {
    const studentNumbers = value.filter(v => !errorStudentNumbers.has(v))
    setValue(studentNumbers)
    formikProps.setFieldValue(name, studentNumbers)
    formikProps.setStatus({ ...formikProps.status, [name]: undefined })
    inputRef.current?.focus()
  }

  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false)
  const [removeConfirmed, setRemoveConfirmed] = React.useState(false)

  const handleConfirmRemove = () => {
    setRemoveConfirmed(true)
    setRemoveDialogOpen(false)
  }

  // Remove only after the transition: while the dialog is open the rest of the page is
  // aria-hidden, and Firefox does not announce focus moved into hidden content
  const handleRemoveDialogExited = () => {
    if (!removeConfirmed) return
    setRemoveConfirmed(false)
    removeErrorStudentNumbers()
  }

  const [firstErrorStudentNumber] = errorStudentNumbers
  const removeConfirmation =
    errorStudentNumbers.size === 1
      ? t('organisationSurveys:confirmStudentDelete', { studentNumber: firstErrorStudentNumber })
      : t('organisationSurveys:confirmStudentDeleteMany', { count: errorStudentNumbers.size })

  const removeConfirmationDetails = errorStudentNumbers.size > 1 && (
    <Accordion
      variant="outlined"
      disableGutters
      sx={{
        mt: 2,
        '&::before': { display: 'none' },
        '&:last-of-type': { borderRadius: '0.8rem' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />} sx={{ borderRadius: '0.8rem', ...focusIndicatorStyle() }}>
        {t('organisationSurveys:studentNumbersToRemove')}
      </AccordionSummary>
      <AccordionDetails>
        <Box component="ul" sx={{ m: 0, columnWidth: '8rem' }}>
          {[...errorStudentNumbers].map(studentNumber => (
            <li key={studentNumber}>{studentNumber}</li>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  )

  return (
    <Box>
      <Typography variant="body1" mb={2}>
        {title}
      </Typography>

      <StudenNumberInputInfo />

      <Autocomplete
        data-cy="formik-student-number-input-field"
        id={name}
        name={name}
        multiple
        fullWidth
        clearOnBlur
        options={[]}
        freeSolo
        value={value}
        inputValue={inputValue}
        onChange={(_, studentNumbers, reason, detail) => {
          if (
            editView &&
            reason === 'removeOption' &&
            !window.confirm(
              t('organisationSurveys:confirmStudentDelete', {
                studentNumber: detail.option,
              })
            )
          )
            return

          setValue(studentNumbers)
          formikProps.setFieldValue(name, studentNumbers)
        }}
        onInputChange={(_, newInputValue) => {
          const options = newInputValue.split(/[,\n; ]/)
          if (options.length > 1) {
            const studentNumbers = value
              .concat(options)
              .filter(v => v)
              .map(v => {
                if (v.length < 9 && ADD_LEADING_ZERO_TO_STUDENT_NUMBERS) {
                  return `0${v}`
                }
                return v
              })
            setValue(studentNumbers)
            formikProps.setFieldValue(name, studentNumbers)
            setInputValue('')
          } else {
            setInputValue(newInputValue)
          }
        }}
        renderTags={(value, getTagProps) => {
          // Show the first and the last chips (the last ones so that Backspace removes a visible one),
          // and always show the erroneous ones
          const firstEndIndex = value.length - VISIBLE_STUDENT_NUMBERS_AT_END
          const visible = value
            .map((option, index) => ({ option, index }))
            .filter(
              ({ option, index }) =>
                showAllStudentNumbers ||
                index < VISIBLE_STUDENT_NUMBERS_AT_START ||
                index >= firstEndIndex ||
                errorStudentNumbers.has(option)
            )
          const hasHidden = visible.length < value.length

          const ellipsis = hasHidden && (
            <Typography key="ellipsis" component="span" variant="body2" aria-hidden sx={{ mx: 1 }}>
              …
            </Typography>
          )

          return visible.flatMap(({ option, index }) => [
            index === firstEndIndex && ellipsis,
            <Chip
              {...getTagProps({ index })}
              data-cy={`formik-student-number-input-field-chip-${option}`}
              key={`${option}-${index}`}
              variant="outlined"
              label={option}
              color={errorStudentNumbers.has(option) ? 'error' : 'primary'}
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
        {...props}
      />

      {hasError && removeButtonLabelKey && (
        <NorButton
          ref={removeButtonRef}
          data-cy="formik-student-number-input-remove-erroneous"
          color="cancel"
          type="button"
          onClick={editView ? () => setRemoveDialogOpen(true) : removeErrorStudentNumbers}
          sx={{ mt: 1 }}
        >
          {t(removeButtonLabelKey)}
        </NorButton>
      )}

      <ConfirmDialog
        open={removeDialogOpen}
        onClose={() => setRemoveDialogOpen(false)}
        onConfirm={handleConfirmRemove}
        // The remove button disappears with the numbers, so focus is moved to the input instead
        disableRestoreFocus={removeConfirmed}
        onExited={handleRemoveDialogExited}
        title={t('organisationSurveys:confirmStudentDeleteTitle')}
        content={removeConfirmation}
        details={removeConfirmationDetails}
        confirmLabel={t('organisationSurveys:remove')}
        confirmColor="error"
        dataCy="formik-student-number-input-remove-erroneous-dialog"
      />

      {canHideStudentNumbers && (
        <ShowAllStudentsToggle
          count={value.length}
          showAll={showAllStudentNumbers}
          onShowAllChange={setShowAllStudentNumbers}
        />
      )}
    </Box>
  )
}

const OrganisationSurveyForm = ({ organisationCode, editView }) => {
  const { t } = useTranslation()

  return (
    <Grid spacing={4} container>
      <FormikLocalesFieldEditor name="name" localesLabelString="organisationSurveys:newSurveyName" />

      <Grid size={{ xs: 12, sm: 12, md: 6 }}>
        <FormikDatePicker name="startDate" label={t('organisationSurveys:startDate')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6 }}>
        <FormikDatePicker name="endDate" label={t('organisationSurveys:endDate')} />
      </Grid>

      <Grid size={12}>
        <ResponsibleTeachersSelector
          name="teachers"
          title={
            editView
              ? t('organisationSurveys:editResponsibleTeacherTitle')
              : t('organisationSurveys:responsibleTeacherTitle')
          }
          label={t('organisationSurveys:responsibleTeacherEmail')}
        />
      </Grid>

      <Grid size={12}>
        <StudentNumberInput
          name="studentNumbers"
          title={
            editView ? t('organisationSurveys:editStudentNumberTitle') : t('organisationSurveys:studentNumberTitle')
          }
          label={t('organisationSurveys:studentNumberInputLabel')}
          editView={editView}
        />
      </Grid>
      <CourseSearchInput organisationCode={organisationCode} />
    </Grid>
  )
}

const OrganisationSurveyEditor = ({
  title,
  initialValues,
  validationSchema,
  handleSubmit,
  editing,
  onStopEditing,
  editView = false,
  organisationCode,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog maxWidth={false} open={editing} onClose={onStopEditing}>
      <DialogTitle data-cy="organisation-surveys-editor-title">{title}</DialogTitle>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validationSchema={validationSchema}
      >
        {({ isSubmitting }) => {
          const disabled = isSubmitting

          return (
            <Form>
              <Box sx={{ m: 4 }}>
                <OrganisationSurveyForm organisationCode={organisationCode} editView={editView} />
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'right', gap: 2 }}>
                  <NorButton
                    data-cy="organisation-survey-editor-save"
                    disabled={disabled}
                    color="primary"
                    type="submit"
                  >
                    {t('common:save')}
                  </NorButton>
                  <NorButton
                    data-cy="organisation-survey-editor-cancel"
                    color="cancel"
                    type="button"
                    onClick={onStopEditing}
                  >
                    {t('common:cancel')}
                  </NorButton>
                </Box>
              </Box>
            </Form>
          )
        }}
      </Formik>
    </Dialog>
  )
}

export default OrganisationSurveyEditor
