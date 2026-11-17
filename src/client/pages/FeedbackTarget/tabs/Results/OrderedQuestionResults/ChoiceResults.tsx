import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'

import AnswerTable from './AnswerTable'
import BarRows from './BarRows'
import { getOptionCounts } from './counts'
import WorkloadChart from './WorkloadChart'

type ChoiceResultsProps = {
  question: ResultQuestion
  feedbackCount: number
  showTable: boolean
}

const ChoiceResults = ({ question, feedbackCount, showTable }: ChoiceResultsProps) => {
  const { i18n } = useTranslation()
  const options = getOptionCounts(question, i18n.language)

  if (showTable) return <AnswerTable question={question} rows={options} feedbackCount={feedbackCount} />

  if (question.secondaryType === 'WORKLOAD') return <WorkloadChart question={question} />

  return <BarRows rows={options} feedbackCount={feedbackCount} />
}

export default ChoiceResults
