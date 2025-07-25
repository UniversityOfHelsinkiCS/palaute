import React from 'react'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { uniq } from 'lodash-es'
import useQuestionPublicityMutation from '../../hooks/useQuestionPublicityMutation'
import QuestionEditor from './QuestionEditor'
import { validateQuestions } from './utils'
import { getFormInitialValues } from './getFormInitialValues'
import useInteractiveMutation from '../../hooks/useInteractiveMutation'
import useUpdateTeacherSurvey from '../../hooks/useUpdateTeacherSurvey'

const TeacherSurvey = ({ feedbackTarget }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const teacherSurveyMutation = useUpdateTeacherSurvey(feedbackTarget)
  const updateSurvey = useInteractiveMutation(questions => teacherSurveyMutation.mutateAsync(questions))
  const questionPublicityMutation = useQuestionPublicityMutation({
    resource: 'feedbackTarget',
    resourceId: feedbackTarget.id,
  })
  const togglePublicity = useInteractiveMutation(ids => questionPublicityMutation.mutateAsync(ids))

  const onPublicityToggle = async (question, isPublic) => {
    const newPublicQuestionIds = isPublic
      ? uniq(feedbackTarget.publicQuestionIds.concat(question.id))
      : feedbackTarget.publicQuestionIds.filter(id => id !== question.id)
    await togglePublicity(newPublicQuestionIds)
  }

  const handleSubmit = async values => {
    if (!validateQuestions(values)) {
      enqueueSnackbar(t('common:choiceQuestionError'), { variant: 'error' })
      return
    }

    await updateSurvey(values)
  }

  const { surveys, publicQuestionIds, publicityConfigurableQuestionIds, userCreated } = feedbackTarget

  const programmeQuestions = surveys.programmeSurveys.flatMap(survey => survey.questions)

  const initialValues = React.useMemo(
    () =>
      getFormInitialValues({
        teacherQuestions: surveys.teacherSurvey.questions,
        programmeQuestions,
        universityQuestions: surveys.universitySurvey.questions,
        publicQuestionIds,
        publicityConfigurableQuestionIds,
        editorLevel: 'teacher',
      }),
    [feedbackTarget]
  )

  return (
    <QuestionEditor
      initialValues={initialValues}
      handleSubmit={handleSubmit}
      handlePublicityToggle={onPublicityToggle}
      publicQuestionIds={publicQuestionIds}
      publicityConfigurableQuestionIds={publicityConfigurableQuestionIds}
      teacherQuestionIds={surveys.teacherSurvey.questionIds}
      copyFromCourseDialog
      groupingQuestionSettings
      userCreated={userCreated}
    />
  )
}

export default TeacherSurvey
