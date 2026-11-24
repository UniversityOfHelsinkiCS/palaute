import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import useInteractiveMutation from '../../hooks/useInteractiveMutation'
import useQuestionPublicityMutation from '../../hooks/useQuestionPublicityMutation'
import apiClient from '../../util/apiClient'
import queryClient from '../../util/queryClient'
import { getFormInitialValues } from './getFormInitialValues'
import QuestionEditor from './QuestionEditor'
import { SaveCancelled } from './useQuestionSaving'

const ProgrammeSurvey = ({ organisation, survey }) => {
  const { t } = useTranslation()

  const surveyId = survey?.id

  // Asked once, before the first change of any kind is written
  const confirmedRef = useRef(false)
  const confirmEdit = () => {
    confirmedRef.current ||= window.confirm(t('organisationSettings:editProgrammeQuestionsDialogContent'))
    return confirmedRef.current
  }

  const mutation = useQuestionPublicityMutation({
    resource: 'organisation',
    resourceId: organisation.code,
  })

  const programmeSurveyKey = ['programmeSurvey', organisation.code]

  const saveQuestions = async payload => {
    if (!confirmEdit()) throw new SaveCancelled()

    const { data } = await apiClient.put(`/surveys/${surveyId}/questions`, payload)
    // The editor reads the survey once when it opens, so the cache must not keep the old questions
    queryClient.setQueryData(programmeSurveyKey, current => current && { ...current, ...data })
    // New public questions change the organisation's public questions
    void queryClient.invalidateQueries({ queryKey: ['organisation', organisation.code] })
    return data
  }

  const togglePublicity = useInteractiveMutation(publicity => mutation.mutateAsync(publicity))
  const onPublicityToggle = (question, isPublic) =>
    confirmEdit() && togglePublicity({ questionId: question.id, isPublic })

  const { universitySurvey } = survey
  const allQuestions = universitySurvey.questions.concat(survey.questions)
  const allQuestionIds = allQuestions.map(({ id }) => id)
  const publicQuestionIds = universitySurvey.publicQuestionIds.concat(organisation.publicQuestionIds)
  const publicityConfigurableQuestionIds = allQuestionIds.filter(id => !universitySurvey.publicQuestionIds.includes(id))

  const initialValues = getFormInitialValues({
    programmeQuestions: survey.questions,
    universityQuestions: universitySurvey.questions,
    publicQuestionIds,
    publicityConfigurableQuestionIds,
    editorLevel: 'programme',
  })

  return (
    <QuestionEditor
      key={surveyId}
      initialValues={initialValues}
      questionsVersion={survey.questionsVersion}
      saveQuestions={saveQuestions}
      handlePublicityToggle={onPublicityToggle}
      editorLevel="programme"
    />
  )
}

export default ProgrammeSurvey
