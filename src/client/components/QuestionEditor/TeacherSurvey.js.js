import React from 'react'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { Button } from '@mui/material'
import { useField } from 'formik'
import _ from 'lodash'
import useQuestionPublicityMutation from '../../hooks/useQuestionPublicityMutation'
import QuestionEditor from './QuestionEditor'
import apiClient from '../../util/apiClient'
import queryClient from '../../util/queryClient'
import { copyQuestionsFromFeedbackTarget, validateQuestions } from './utils'
import CopyFromCourseDialog from './CopyFromCourseDialog'
import { getFormInitialValues } from './getFormInitialValues'

const saveQuestionsValues = async (values, feedbackTarget) => {
  const { questions } = values
  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const editableQuestions = questions.filter(({ editable }) => editable)

  const payload = {
    surveyId,
    questions: editableQuestions,
  }
  const { data } = await apiClient.put(`/feedback-targets/${id}`, payload)

  const { questions: updatedQuestions } = data
  if (updatedQuestions && Array.isArray(updatedQuestions) && updatedQuestions.length > 0) {
    // update cache
    queryClient.refetchQueries(['feedbackTarget', String(id)])
  }

  return data
}

const QuestionEditorActions = ({ onCopy = () => {} }) => {
  const { t } = useTranslation()
  const [, meta, helpers] = useField('questions')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = () => setDialogOpen(false)

  const handleOpenDialog = () => setDialogOpen(true)

  const handleCopy = feedbackTarget => {
    handleCloseDialog()

    helpers.setValue([...meta.value, ...copyQuestionsFromFeedbackTarget(feedbackTarget)])

    enqueueSnackbar(t('editFeedbackTarget:copySuccessSnackbar'), {
      variant: 'info',
    })

    onCopy()
  }

  return (
    <>
      <CopyFromCourseDialog open={dialogOpen} onClose={handleCloseDialog} onCopy={handleCopy} />

      <Button color="primary" onClick={handleOpenDialog}>
        {t('editFeedbackTarget:copyFromCourseButton')}
      </Button>
    </>
  )
}

const TeacherSurvey = ({ feedbackTarget }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const mutation = useQuestionPublicityMutation({
    resource: 'feedbackTarget',
    resourceId: feedbackTarget.id,
  })

  const onPublicityToggle = async (question, isPublic) => {
    const newPublicQuestionIds = isPublic
      ? _.uniq(feedbackTarget.publicQuestionIds.concat(question.id))
      : feedbackTarget.publicQuestionIds.filter(id => id !== question.id)

    try {
      await mutation.mutateAsync(newPublicQuestionIds)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const handleSubmit = async values => {
    try {
      if (!validateQuestions(values)) {
        enqueueSnackbar(t('choiceQuestionError'), { variant: 'error' })
      } else {
        await saveQuestionsValues(values, feedbackTarget)

        enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
      }
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const { surveys, publicQuestionIds, publicityConfigurableQuestionIds } = feedbackTarget

  const programmeQuestions = surveys.programmeSurveys.reduce(
    (questions, survey) => questions.concat(survey.questions),
    []
  )

  const initialValues = getFormInitialValues({
    teacherQuestions: surveys.teacherSurvey.questions,
    programmeQuestions,
    universityQuestions: surveys.universitySurvey.questions,
    publicQuestionIds,
    publicityConfigurableQuestionIds,
    editorLevel: 'teacher',
  })

  return (
    <QuestionEditor
      initialValues={initialValues}
      handleSubmit={handleSubmit}
      handlePublicityToggle={onPublicityToggle}
      publicQuestionIds={publicQuestionIds}
      publicityConfigurableQuestionIds={publicityConfigurableQuestionIds}
      actions={<QuestionEditorActions onCopy={handleSubmit} />}
    />
  )
}

export default TeacherSurvey
