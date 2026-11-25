import { useSnackbar } from 'notistack'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { getClientId } from './utils'

/** Thrown by a save function when the user declines to save, the change is then discarded */
export class SaveCancelled extends Error {}

/** Thrown by a save function with a message to show instead of the generic error */
export class SaveRejected extends Error {}

const mapQuestions = (values, fn) => ({
  ...values,
  questions: values.questions.map(fn),
  groupingQuestion: values.groupingQuestion && fn(values.groupingQuestion),
})

const getEditableQuestions = ({ questions, groupingQuestion }) =>
  [...questions, groupingQuestion].filter(question => question?.editable)

const toPayload = question => ({
  ...(question.id ? { id: question.id } : { clientId: getClientId(question) }),
  type: question.type,
  secondaryType: question.secondaryType,
  required: Boolean(question.required),
  data: question.data,
  public: question.public,
})

const getErrorKey = error => {
  if (error?.response?.status === 409) return 'questionEditor:changedElsewhere'
  return 'questionEditor:saveFailed'
}

/**
 * Saves one snapshot of the question form at a time. While a save is running, only the newest
 * snapshot waits. Responses only add IDs to the form, they never reset it.
 */
const useQuestionSaving = ({ initialValues, questionsVersion, saveQuestions }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const formikRef = useRef(null)
  const saveRef = useRef(saveQuestions)

  const pendingRef = useRef(null)
  const runningRef = useRef(false)
  const mountedRef = useRef(true)
  const createdIdsRef = useRef({})
  // The server refuses a save if anyone else has saved the questions since this version
  const versionRef = useRef(questionsVersion)
  const lastSavedRef = useRef(initialValues)
  // A change that is waiting, being saved or failed to save
  const unsavedRef = useRef(false)

  const withKnownIds = question => {
    const id = question.id ?? createdIdsRef.current[getClientId(question)]
    return id === question.id ? question : { ...question, id }
  }

  const applyToForm = fn => {
    if (mountedRef.current) formikRef.current?.setValues(values => mapQuestions(values, fn))
  }

  const run = async () => {
    if (runningRef.current) return
    runningRef.current = true

    while (pendingRef.current) {
      const snapshot = mapQuestions(pendingRef.current, withKnownIds)
      pendingRef.current = null

      try {
        const payload = {
          questions: getEditableQuestions(snapshot).map(toPayload),
          questionsVersion: versionRef.current,
        }
        const result = await saveRef.current(payload, snapshot)
        Object.assign(createdIdsRef.current, result.createdIds)
        versionRef.current = result.questionsVersion
        lastSavedRef.current = mapQuestions(snapshot, withKnownIds)
        applyToForm(withKnownIds)
        unsavedRef.current = Boolean(pendingRef.current)
        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      } catch (error) {
        if (error instanceof SaveCancelled) {
          pendingRef.current = null
          unsavedRef.current = false
          formikRef.current?.resetForm({ values: lastSavedRef.current })
        } else {
          // The failed change stays in the form and is sent again with the next save
          const message = error instanceof SaveRejected ? error.message : t(getErrorKey(error))
          enqueueSnackbar(message, { variant: 'error' })
        }
      }
    }

    runningRef.current = false
  }

  useLayoutEffect(() => {
    saveRef.current = saveQuestions
  })

  const request = values => {
    pendingRef.current = values
    unsavedRef.current = true
    void run()
  }

  useEffect(() => {
    mountedRef.current = true
    // Closing or reloading the page would drop changes that aren't saved yet
    const warnBeforeLeaving = event => {
      if (unsavedRef.current) event.preventDefault()
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => {
      mountedRef.current = false
      window.removeEventListener('beforeunload', warnBeforeLeaving)
    }
  }, [])

  return { formikRef, request }
}

export default useQuestionSaving
