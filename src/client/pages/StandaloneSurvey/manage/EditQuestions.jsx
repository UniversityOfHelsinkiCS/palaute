import { partition } from 'lodash-es'
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

  const initialValues = useMemo(() => {
    const [groupingQuestions, questions] = partition(
      withPublicity(survey, survey.publicQuestionIds).map(q => ({ ...q, editable: true, publicityConfigurable: true })),
      q => q.secondaryType === 'GROUPING'
    )
    const [groupingQuestion] = groupingQuestions.map(q => ({ ...q, publicityConfigurable: false }))
    return { questions, groupingQuestion }
  }, [survey])

  const handleSubmit = async values => {
    if (!validateQuestions(values)) {
      enqueueSnackbar(t('common:choiceQuestionError'), { variant: 'error' })
      return
    }
    await save([values.groupingQuestion, ...values.questions].filter(Boolean))
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
      groups={[]}
    />
  )
}

export default EditQuestions
