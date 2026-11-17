import type { Question } from '@common/types/question'

import { uniq } from 'lodash-es'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'

type Options = {
  question: Pick<Question, 'id' | 'type'>
  publicQuestionIds: number[]
  savePublicQuestionIds: (publicQuestionIds: number[]) => Promise<unknown>
}

const useQuestionPublicity = ({ question, publicQuestionIds, savePublicQuestionIds }: Options) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const isPublic = publicQuestionIds.includes(question.id)

  const save = async (nextIsPublic: boolean) => {
    const newPublicQuestionIds = nextIsPublic
      ? uniq(publicQuestionIds.concat(question.id))
      : publicQuestionIds.filter(id => id !== question.id)

    try {
      await savePublicQuestionIds(newPublicQuestionIds)
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
