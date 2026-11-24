import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'

import QuestionPublicityToggle from '../../../../../components/common/QuestionPublicityToggle'
import { getLanguageValue } from '../../../../../util/languageUtils'
import { useTranslationContext } from '../../../../../util/translationContext'
import useQuestionPublicity from '../QuestionResults/useQuestionPublicity'

export type PublicitySettings = {
  publicQuestionIds: number[]
  configurableQuestionIds?: number[]
  isOpen: boolean
  setQuestionPublicity: (questionId: number, isPublic: boolean) => Promise<unknown>
}

const QuestionPublicity = ({
  question,
  publicQuestionIds,
  configurableQuestionIds,
  isOpen,
  setQuestionPublicity,
}: PublicitySettings & { question: ResultQuestion }) => {
  const { t, i18n } = useTranslation()
  const context = useTranslationContext()
  const { isPublic, togglePublicity } = useQuestionPublicity({ question, publicQuestionIds, setQuestionPublicity })

  const isConfigurable = configurableQuestionIds?.includes(question.id) ?? false
  const isLockedUntilClose = question.type === 'OPEN' && isOpen

  return (
    <QuestionPublicityToggle
      questionId={question.id}
      checked={isPublic}
      disabled={!isConfigurable || isLockedUntilClose}
      disabledInfo={isConfigurable && isLockedUntilClose ? t('common:editableAfterClose', { context }) : undefined}
      onChange={togglePublicity}
      questionLabel={getLanguageValue(question.data.label, i18n.language) ?? undefined}
      info={question.type === 'OPEN' ? t('feedbackTargetResults:hidingFeatureInfo', { context }) : undefined}
      size="small"
    />
  )
}

export default QuestionPublicity
