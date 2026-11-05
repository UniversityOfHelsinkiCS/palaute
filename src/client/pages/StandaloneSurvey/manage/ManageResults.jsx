import { format } from 'date-fns'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import useOpenAnswerActions from '../../../hooks/useOpenAnswerActions'
import { getLanguageValue } from '../../../util/languageUtils'
import ExportFeedbacksMenu from '../../FeedbackTarget/tabs/Results/ExportFeedbacksMenu'
import { useManagedResults, useUpdateQuestions } from '../api'
import SurveyResults from '../SurveyResults'
import { toQuestionInputs, withPublicity } from './EditQuestions'

const getFilename = (survey, language) =>
  `${getLanguageValue(survey.name, language)}_${format(new Date(survey.opensAt), 'yyyy-MM-dd')}`.replace(
    /[^\p{L}\p{N}_-]+/gu,
    '_'
  )

const ManageResults = ({ survey, isOpen }) => {
  const { i18n } = useTranslation()
  const exportRef = useRef(null)
  const results = useManagedResults(survey.id)
  const updateQuestions = useUpdateQuestions(survey.id)
  const openAnswerActions = useOpenAnswerActions({
    hidePath: `/standalone-surveys/${survey.id}/hide-answer`,
    deletePath: `/standalone-surveys/${survey.id}/delete-answer`,
    queryKey: ['standaloneSurveyResults', String(survey.id)],
    canHide: true,
    canDelete: survey.access.isAdmin,
  })

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
