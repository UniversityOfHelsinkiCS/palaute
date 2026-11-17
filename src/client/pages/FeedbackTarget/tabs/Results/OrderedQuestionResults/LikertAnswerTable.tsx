import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'

import AverageResult from '../QuestionResults/AverageResult'
import AnswerTable from './AnswerTable'
import { getLikertCounts, LIKERT_VALUES } from './counts'

const LikertAnswerTable = ({ question, feedbackCount }: { question: ResultQuestion; feedbackCount: number }) => {
  const { t } = useTranslation()
  const counts = getLikertCounts(question)

  return (
    <AnswerTable
      question={question}
      feedbackCount={feedbackCount}
      rows={[
        ...LIKERT_VALUES.map(value => ({ id: value, label: String(value), count: counts[value] })),
        { id: 0, label: t('feedbackView:dontKnowOption'), count: counts[0] },
      ]}
      mean={<AverageResult question={question} variant="underlined" />}
    />
  )
}

export default LikertAnswerTable
