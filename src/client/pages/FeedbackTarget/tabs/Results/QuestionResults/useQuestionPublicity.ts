import type { Question } from '@common/types/question'

import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'

type Options = {
  question: Pick<Question, 'id' | 'type'>
  publicQuestionIds: number[]
  setQuestionPublicity: (questionId: number, isPublic: boolean) => Promise<unknown>
}

const useQuestionPublicity = ({ question, publicQuestionIds, setQuestionPublicity }: Options) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const isPublic = publicQuestionIds.includes(question.id)

  const save = async (nextIsPublic: boolean) => {
    try {
      await setQuestionPublicity(question.id, nextIsPublic)
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    } catch {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const togglePublicity = () => {
    if (isPublic) {
      void save(false)
      return
    }

    const toggleAccepted = question.type !== 'OPEN' || window.confirm(t('questionResults:publicQuestionConfirmation'))

    if (toggleAccepted) {
      void save(true)
    }
  }

  return { isPublic, togglePublicity }
}

export default useQuestionPublicity
