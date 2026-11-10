import { partition } from 'lodash-es'
import { useSnackbar } from 'notistack'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import QuestionEditor from '../../../components/QuestionEditor/QuestionEditor'
import { validateQuestions } from '../../../components/QuestionEditor/utils'
import useInteractiveMutation from '../../../hooks/useInteractiveMutation'
import { useUpdateQuestions } from '../api'

export const toQuestionInputs = questions =>
  questions.map(({ id, type, secondaryType, required, data, public: isPublic }) => ({
    ...(id ? { id } : {}),
    type,
    secondaryType: secondaryType === 'GROUPING' ? 'GROUPING' : null,
    required: Boolean(required),
    data,
    visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
  }))

export const withPublicity = (survey, publicQuestionIds) =>
  survey.questions.map(q => ({ ...q, public: publicQuestionIds.includes(q.id) }))

export const useSaveQuestions = surveyId => {
  const updateQuestions = useUpdateQuestions(surveyId)
  return useInteractiveMutation(questions => updateQuestions.mutateAsync({ questions: toQuestionInputs(questions) }))
}

const EditQuestions = ({ survey }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const save = useSaveQuestions(survey.id)

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
    await save(withPublicity(survey, isPublic ? [...publicIds, question.id] : publicIds))
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
