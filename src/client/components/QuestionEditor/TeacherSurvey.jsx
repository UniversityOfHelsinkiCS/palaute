import React from 'react'
import { useTranslation } from 'react-i18next'

import useInteractiveMutation from '../../hooks/useInteractiveMutation'
import useQuestionPublicityMutation from '../../hooks/useQuestionPublicityMutation'
import useUpdateTeacherSurvey from '../../hooks/useUpdateTeacherSurvey'
import { getSurveyType } from '../../util/courseIdentifiers'
import { TranslationContextProvider } from '../../util/translationContext'
import { getFormInitialValues } from './getFormInitialValues'
import QuestionEditor from './QuestionEditor'
import { SaveRejected } from './useQuestionSaving'
import { validateQuestions } from './utils'

const TeacherSurvey = ({ feedbackTarget }) => {
  const { t } = useTranslation()
  const teacherSurveyMutation = useUpdateTeacherSurvey(feedbackTarget)
  const questionPublicityMutation = useQuestionPublicityMutation({
    resource: 'feedbackTarget',
    resourceId: feedbackTarget.id,
  })
  const togglePublicity = useInteractiveMutation(publicity => questionPublicityMutation.mutateAsync(publicity))

  const onPublicityToggle = (question, isPublic) => togglePublicity({ questionId: question.id, isPublic })

  const saveQuestions = (payload, values) => {
    if (!validateQuestions(values)) throw new SaveRejected(t('common:choiceQuestionError'))
    return teacherSurveyMutation.mutateAsync(payload)
  }

  const { surveys, publicQuestionIds, publicityConfigurableQuestionIds, userCreated, courseRealisation } =
    feedbackTarget

  const { isInterimFeedback } = getSurveyType(feedbackTarget.courseUnit, feedbackTarget)

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
    // For interim feedbacks, translations with an `_interim` variant are used if available
    <TranslationContextProvider value={isInterimFeedback ? 'interim' : undefined}>
      <QuestionEditor
        key={feedbackTarget.id}
        initialValues={initialValues}
        questionsVersion={surveys.teacherSurvey.questionsVersion}
        saveQuestions={saveQuestions}
        handlePublicityToggle={onPublicityToggle}
        teacherQuestionIds={surveys.teacherSurvey.questionIds}
        copyFromCourseDialog
        groupingQuestionSettings
        groups={feedbackTarget.groups}
        userCreated={userCreated}
        curStartDate={courseRealisation?.startDate}
      />
    </TranslationContextProvider>
  )
}

export default TeacherSurvey
