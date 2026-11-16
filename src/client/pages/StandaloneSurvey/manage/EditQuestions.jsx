import { useSnackbar } from 'notistack'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import QuestionEditor from '../../../components/QuestionEditor/QuestionEditor'
import { validateQuestions } from '../../../components/QuestionEditor/utils'
import useInteractiveMutation from '../../../hooks/useInteractiveMutation'
import { useUpdatePublicQuestions, useUpdateQuestions } from '../api'

const toQuestionInputs = questions =>
  questions.map(({ id, type, secondaryType, required, data, public: isPublic }) => ({
    ...(id ? { id } : { visibility: isPublic ? 'PUBLIC' : 'PRIVATE' }),
    type,
    secondaryType: secondaryType === 'GROUPING' ? 'GROUPING' : null,
    required: Boolean(required),
    data,
  }))

const withPublicity = (survey, publicQuestionIds) =>
  survey.questions.map(q => ({ ...q, public: publicQuestionIds.includes(q.id) }))

const EditQuestions = ({ survey }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const updateQuestions = useUpdateQuestions(survey.id)
  const updatePublicQuestions = useUpdatePublicQuestions(survey.id)
  const save = useInteractiveMutation(questions =>
    updateQuestions.mutateAsync({ questions: toQuestionInputs(questions) })
  )
  const savePublicQuestionIds = useInteractiveMutation(publicQuestionIds =>
    updatePublicQuestions.mutateAsync({ publicQuestionIds })
  )

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

  const handleSubmit = async values => {
    if (!validateQuestions(values)) {
      enqueueSnackbar(t('common:choiceQuestionError'), { variant: 'error' })
      return
    }
    await save(values.questions)
  }

  const handlePublicityToggle = async (question, isPublic) => {
    const publicIds = survey.publicQuestionIds.filter(id => id !== question.id)
    await savePublicQuestionIds(isPublic ? [...publicIds, question.id] : publicIds)
  }

  return (
    <QuestionEditor
      initialValues={initialValues}
      handleSubmit={handleSubmit}
      handlePublicityToggle={handlePublicityToggle}
      groupingQuestionSettings
      movableGroupingQuestion
      groups={[]}
    />
  )
}

export default EditQuestions
