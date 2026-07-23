import LikertResultItem from './LikertResultItem'
import ResultItemBase from './ResultItemBase'
import WorkloadResultItem from './WorkloadResultItem'

const SummaryResultItem = ({ question, distribution, ...props }) => {
  if (question.type === 'LIKERT') {
    return <LikertResultItem question={question} {...props} />
  }

  if (question.secondaryType === 'WORKLOAD') {
    return <WorkloadResultItem question={question} distribution={distribution} {...props} />
  }

  return <ResultItemBase {...props}>-</ResultItemBase>
}

export default SummaryResultItem
