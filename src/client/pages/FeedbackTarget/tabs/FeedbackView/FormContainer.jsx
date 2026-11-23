import { Typography, Box, Card, CardContent, Alert, Stack } from '@mui/material'
import { Formik, Form, useFormikContext } from 'formik'
import { useSnackbar } from 'notistack'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AlertLink from '../../../../components/common/AlertLink'
import ConfirmDialog from '../../../../components/common/ConfirmDialog'
import { NorButton } from '../../../../components/common/NorButton'
import { FEEDBACK_HIDDEN_STUDENT_COUNT } from '../../../../util/common'
import { useTranslationContext } from '../../../../util/translationContext'
import { ConsentCheckbox } from './ConsentCheckbox'
import ErrorSummary from './ErrorSummary'
import FeedbackForm from './FeedbackForm'
import { answersEqual, clearDraft, loadDraft, mergeDraft, saveDraft } from './utils'

// Keeps a copy of the answers in sessionStorage while the user fills in the form.
const DraftSaver = ({ draftKey, submittedAnswers }) => {
  const { values } = useFormikContext()
  const [initialSubmittedAnswers] = useState(submittedAnswers)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (answersEqual(values.answers, initialSubmittedAnswers)) {
        clearDraft(draftKey)
      } else {
        saveDraft(draftKey, values.answers)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [draftKey, values.answers, initialSubmittedAnswers])

  return null
}

const FormContainer = ({
  onSubmit,
  initialValues,
  onOpenPrivacyDialog,
  validate,
  questions,
  fewEnrolled,
  disabled: disabledProp,
  showCannotSubmitText = false,
  showSubmitButton = true,
  isEdit = false,
  inTabPanel = false,
  draftKey = null,
}) => {
  const { t } = useTranslation()
  const context = useTranslationContext()
  const { enqueueSnackbar } = useSnackbar()
  const questionsRef = useRef(null)
  const actionsRef = useRef(null)
  const submitButtonRef = useRef(null)

  // Read once when the form mounts: Formik only uses initialValues on its first render
  const [restoredAnswers] = useState(() =>
    draftKey ? mergeDraft(initialValues.answers, loadDraft(draftKey), questions) : null
  )
  const [showDraftNotice, setShowDraftNotice] = useState(Boolean(restoredAnswers))
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const [discardConfirmed, setDiscardConfirmed] = useState(false)

  const handleDiscardDialogExited = () => {
    if (!discardConfirmed) return
    setDiscardConfirmed(false)

    // Select focus target. The excluded textareas are MUI's hidden copies used to size multiline fields
    const firstField = !isEdit
      ? questionsRef.current?.querySelector(
          'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]):not([aria-hidden="true"])'
        )
      : null
    const submitButton = submitButtonRef.current
    const actionTarget =
      submitButton && !submitButton.disabled
        ? submitButton
        : actionsRef.current?.querySelector('input[type="checkbox"]')

    const focusTarget = firstField ?? actionTarget
    focusTarget?.focus()
  }

  const handleSubmit = async (values, formikHelpers) => {
    if (isEdit && answersEqual(values.answers, initialValues.answers)) {
      enqueueSnackbar(t('feedbackView:noUnsavedChanges'), { variant: 'info' })
      return
    }

    await onSubmit(values, formikHelpers)
  }

  return (
    <Formik
      initialValues={{ ...initialValues, answers: restoredAnswers ?? initialValues.answers, activateSubmit: false }}
      onSubmit={handleSubmit}
      validate={validate}
      validateOnChange={false}
    >
      {({ values, isSubmitting, setFieldValue, errors, submitCount, setFieldTouched, resetForm }) => {
        const disabled = isSubmitting || disabledProp

        const submitDisabled = disabled || (fewEnrolled && !values.activateSubmit && !isEdit)
        const hasChanges = !answersEqual(values.answers, initialValues.answers)
        const showDiscardButton = Boolean(draftKey) && hasChanges && !isSubmitting

        const handleConfirmDiscard = () => {
          clearDraft(draftKey)
          setShowDraftNotice(false)
          resetForm({ values: { ...values, answers: initialValues.answers } })
          setDiscardConfirmed(true)
          setDiscardDialogOpen(false)
        }

        const handleFocusField = fieldName => {
          const questionId = fieldName.split('.')[1]
          const question = questions.find(q => q.id.toString() === questionId)
          const element = document.getElementById(`question-${questionId}`)

          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })

            let focusableElement = null

            if (
              question?.type === 'MULTIPLE_CHOICE' ||
              question?.type === 'SINGLE_CHOICE' ||
              question?.type === 'LIKERT'
            ) {
              focusableElement = element.querySelector('input[type="checkbox"], input[type="radio"]')
            } else if (question?.type === 'OPEN') {
              focusableElement = element.querySelector('textarea')
            }

            if (focusableElement) {
              focusableElement.focus()
            } else {
              const fallbackElement = element.querySelector('input, textarea, button')
              if (fallbackElement) {
                fallbackElement.focus()
              } else {
                element.focus()
              }
            }

            setFieldTouched(fieldName, true, false)
          }
        }

        const hasErrors = submitCount > 0 && errors.answers && Object.keys(errors.answers).length > 0

        const formContent = (
          <>
            <Box sx={{ mb: showDraftNotice && hasChanges ? 2 : 4 }}>
              <Alert severity="info">
                {t('feedbackView:feedbackInfo', { context })}
                {onOpenPrivacyDialog && (
                  <>
                    {' '}
                    <AlertLink component="button" type="button" onClick={onOpenPrivacyDialog} sx={{ mt: -0.2 }}>
                      {t('feedbackView:feedbackInfoLink')}
                    </AlertLink>
                  </>
                )}
              </Alert>
            </Box>

            {showDraftNotice && hasChanges && (
              <Alert severity="warning" role="presentation" sx={{ mb: 4 }} data-cy="feedback-view-draft-notice">
                {t(isEdit ? 'feedbackView:unsavedChangesNotice' : 'feedbackView:unsentAnswersNotice')}
              </Alert>
            )}

            <Box ref={questionsRef}>
              <FeedbackForm questions={questions} name="answers" disabled={disabledProp && showSubmitButton} />
            </Box>
          </>
        )

        return (
          <Form>
            {draftKey && <DraftSaver draftKey={draftKey} submittedAnswers={initialValues.answers} />}
            {hasErrors && (
              <ErrorSummary
                errors={errors}
                questions={questions}
                onFocusField={handleFocusField}
                submitCount={submitCount}
              />
            )}
            {inTabPanel ? (
              formContent
            ) : (
              <Card>
                <CardContent sx={{ px: { md: 3 }, pt: { md: 3 } }}>{formContent}</CardContent>
              </Card>
            )}

            {showSubmitButton && (
              <Stack ref={actionsRef} spacing={2} sx={{ mt: 2, alignItems: 'flex-start' }}>
                {fewEnrolled && !isEdit && (
                  <ConsentCheckbox
                    dataCy="feedback-view-consent-checkbox"
                    label={t('feedbackView:allowSubmitCheckbox', {
                      count: FEEDBACK_HIDDEN_STUDENT_COUNT,
                    })}
                    handleChange={setFieldValue}
                  />
                )}
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
                  <NorButton
                    ref={submitButtonRef}
                    data-cy="feedback-view-give-feedback"
                    disabled={submitDisabled}
                    color="secondary"
                    variant="contained"
                    type="submit"
                    sx={{ width: 'auto' }}
                  >
                    {isEdit ? t('feedbackView:saveChangesButton') : t('feedbackView:submitButton', { context })}
                  </NorButton>
                  {showDiscardButton && (
                    <NorButton
                      color="secondary"
                      onClick={() => setDiscardDialogOpen(true)}
                      data-cy="feedback-view-discard-changes"
                    >
                      {t('feedbackView:discardChanges')}
                    </NorButton>
                  )}
                </Stack>
                <ConfirmDialog
                  open={discardDialogOpen}
                  onClose={() => setDiscardDialogOpen(false)}
                  onConfirm={handleConfirmDiscard}
                  disableRestoreFocus={discardConfirmed}
                  onExited={handleDiscardDialogExited}
                  title={`${t('feedbackView:discardChanges')}?`}
                  content={t(
                    isEdit ? 'feedbackView:discardChangesConfirmation' : 'feedbackView:discardAnswersConfirmation'
                  )}
                  confirmLabel={t('feedbackView:discardChanges')}
                  confirmColor="error"
                  dataCy="feedback-view-discard-dialog"
                />
                {showCannotSubmitText && (
                  <Typography color="textSecondary">{t('feedbackView:cannotSubmitText')}</Typography>
                )}
              </Stack>
            )}
          </Form>
        )
      }}
    </Formik>
  )
}

export default FormContainer
