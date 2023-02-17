import React from 'react'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'
import useQuestionPublicityMutation from '../../hooks/useQuestionPublicityMutation'
import QuestionEditor from './QuestionEditor'
import apiClient from '../../util/apiClient'
import queryClient from '../../util/queryClient'
import { validateQuestions } from './utils'
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
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const handleSubmit = async values => {
    try {
      if (!validateQuestions(values)) {
        enqueueSnackbar(t('common:choiceQuestionError'), { variant: 'error' })
      } else {
        await saveQuestionsValues(values, feedbackTarget)

        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      }
    } catch (e) {
      console.error(e)
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
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
      copyFromCourseDialog
    />
  )
}

export default TeacherSurvey
