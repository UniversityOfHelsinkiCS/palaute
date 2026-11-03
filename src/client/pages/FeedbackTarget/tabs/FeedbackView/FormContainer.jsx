import { Typography, Box, Card, CardContent, Alert, Stack } from '@mui/material'
import { Formik, Form } from 'formik'
import { useTranslation } from 'react-i18next'

import AlertLink from '../../../../components/common/AlertLink'
import { NorButton } from '../../../../components/common/NorButton'
import { FEEDBACK_HIDDEN_STUDENT_COUNT } from '../../../../util/common'
import { ConsentCheckbox } from './ConsentCheckbox'
import ErrorSummary from './ErrorSummary'
import FeedbackForm from './FeedbackForm'

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
  infoText,
}) => {
  const { t } = useTranslation()

  return (
    <Formik
      initialValues={{ ...initialValues, activateSubmit: false }}
      onSubmit={onSubmit}
      validate={validate}
      validateOnChange={false}
    >
      {({ values, isSubmitting, setFieldValue, errors, submitCount, setFieldTouched }) => {
        const disabled = isSubmitting || disabledProp

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

        return (
          <Form>
            {hasErrors && (
              <ErrorSummary
                errors={errors}
                questions={questions}
                onFocusField={handleFocusField}
                submitCount={submitCount}
              />
            )}
            <Card>
              <CardContent>
                <Box mb={2}>
                  <Alert severity="info">
                    {infoText ?? t('feedbackView:feedbackInfo')}{' '}
                    <AlertLink component="button" type="button" onClick={onOpenPrivacyDialog} sx={{ mt: -0.2 }}>
                      {t('feedbackView:feedbackInfoLink')}
                    </AlertLink>
                  </Alert>
                </Box>

                <FeedbackForm questions={questions} name="answers" disabled={disabledProp && showSubmitButton} />
              </CardContent>
            </Card>

            {showSubmitButton && (
              <Stack spacing={2} sx={{ mt: 2, alignItems: 'flex-start' }}>
                {fewEnrolled && !isEdit && (
                  <ConsentCheckbox
                    dataCy="feedback-view-consent-checkbox"
                    label={t('feedbackView:allowSubmitCheckbox', {
                      count: FEEDBACK_HIDDEN_STUDENT_COUNT,
                    })}
                    handleChange={setFieldValue}
                  />
                )}
                <NorButton
                  data-cy="feedback-view-give-feedback"
                  disabled={disabled || (fewEnrolled && !values.activateSubmit && !isEdit)}
                  color="secondary"
                  variant="contained"
                  type="submit"
                  sx={{ width: 'auto' }}
                >
                  {isEdit ? t('feedbackView:editButton') : t('feedbackView:submitButton')}
                </NorButton>
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
