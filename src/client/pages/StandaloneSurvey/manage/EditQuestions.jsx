import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import QuestionEditor from '../../../components/QuestionEditor/QuestionEditor'
import { SaveRejected } from '../../../components/QuestionEditor/useQuestionSaving'
import { validateQuestions } from '../../../components/QuestionEditor/utils'
import useInteractiveMutation from '../../../hooks/useInteractiveMutation'
import { useSetQuestionPublicity, useUpdateQuestions } from '../api'

const withPublicity = (survey, publicQuestionIds) =>
  survey.questions.map(q => ({ ...q, public: publicQuestionIds.includes(q.id) }))

const EditQuestions = ({ survey }) => {
  const { t } = useTranslation()
  const updateQuestions = useUpdateQuestions(survey.id)
  const setPublicity = useSetQuestionPublicity(survey.id)
  const savePublicity = useInteractiveMutation(publicity => setPublicity.mutateAsync(publicity))

  const initialValues = useMemo(
    () => ({
      questions: withPublicity(survey, survey.publicQuestionIds).map(q => ({
        ...q,
        editable: true,
        publicityConfigurable: q.secondaryType !== 'GROUPING',
      })),
      groupingQuestion: null,
    }),
    [survey]
  )

  const saveQuestions = (payload, values) => {
    if (!validateQuestions(values)) throw new SaveRejected(t('common:choiceQuestionError'))
    return updateQuestions.mutateAsync(payload)
  }

  const handlePublicityToggle = (question, isPublic) => savePublicity({ questionId: question.id, isPublic })

  return (
    <QuestionEditor
      key={survey.id}
      initialValues={initialValues}
      questionsVersion={survey.questionsVersion}
      saveQuestions={saveQuestions}
      handlePublicityToggle={handlePublicityToggle}
      groupingQuestionSettings
      movableGroupingQuestion
      groups={[]}
    />
  )
}

export default EditQuestions
