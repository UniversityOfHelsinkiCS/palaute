import { useMutation } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import apiClient from '../../../util/apiClient'
import { getLanguageValue } from '../../../util/languageUtils'
import queryClient from '../../../util/queryClient'
import ExportFeedbacksMenu from '../../FeedbackTarget/tabs/Results/ExportFeedbacksMenu'
import { useManagedResults, useUpdateQuestions } from '../api'
import SurveyResults from '../SurveyResults'
import { toQuestionInputs, withPublicity } from './EditQuestions'

const getFilename = (survey, language) =>
  `${getLanguageValue(survey.name, language)}_${survey.opensAt.slice(0, 10)}`.replace(/[^\p{L}\p{N}_-]+/gu, '_')

const useOpenAnswerActions = survey => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const refetch = () => queryClient.invalidateQueries({ queryKey: ['standaloneSurveyResults', String(survey.id)] })

  const hide = useMutation({
    mutationFn: ({ questionId, content, hidden }) =>
      apiClient.put(`/standalone-surveys/${survey.id}/hide-answer`, { questionId, content, hidden }),
    onSuccess: refetch,
  })
  const remove = useMutation({
    mutationFn: ({ questionId, content }) =>
      apiClient.put(`/standalone-surveys/${survey.id}/delete-answer`, { questionId, content }),
    onSuccess: refetch,
  })

  const run = async (mutation, args, successKey) => {
    try {
      const { data } = await mutation.mutateAsync(args)
      enqueueSnackbar(t(successKey, { count: data.count, content: args.content.slice(0, 20) }), { variant: 'info' })
    } catch {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  return {
    canHide: true,
    toggleVisibility: feedback =>
      run(
        hide,
        { questionId: feedback.questionId, content: feedback.data, hidden: !feedback.hidden },
        feedback.hidden ? 'feedbackTargetResults:showSuccess' : 'feedbackTargetResults:hideSuccess'
      ),
    canDelete: survey.access.isAdmin,
    deleteAnswer: feedback => {
      if (window.prompt(t('feedbackTargetResults:confirmDeleteFeedback')) !== 'delete') return
      void run(
        remove,
        { questionId: feedback.questionId, content: feedback.data },
        'feedbackTargetResults:deleteSuccess'
      )
    },
  }
}

const ManageResults = ({ survey, isOpen }) => {
  const { i18n } = useTranslation()
  const exportRef = useRef(null)
  const results = useManagedResults(survey.id)
  const updateQuestions = useUpdateQuestions(survey.id)
  const openAnswerActions = useOpenAnswerActions(survey)

  return (
    <div ref={exportRef}>
      <SurveyResults
        questions={survey.questions}
        publicQuestionIds={survey.publicQuestionIds}
        results={results.data}
        isLoading={results.isLoading}
        isOpen={isOpen}
        isResponsibleUser
        savePublicQuestionIds={ids =>
          updateQuestions.mutateAsync({ questions: toQuestionInputs(withPublicity(survey, ids)) })
        }
        openAnswerActions={openAnswerActions}
        exportMenu={
          <ExportFeedbacksMenu
            questions={survey.questions}
            feedbacks={results.data?.feedbacks}
            filename={getFilename(survey, i18n.language)}
            componentRef={exportRef}
          />
        }
      />
    </div>
  )
}

export default ManageResults
