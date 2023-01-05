import React from 'react'

import LikertResultItem from './LikertResultItem'
import ResultItemBase from './ResultItemBase'
import WorkloadResultItem from './WorkloadResultItem'

const SummaryResultItem = ({ question, ...props }) => {
  if (question.type === 'LIKERT') {
    return <LikertResultItem question={question} {...props} />
  }

  if (question.secondaryType === 'WORKLOAD') {
    return <WorkloadResultItem question={question} {...props} />
  }

  return <ResultItemBase>-</ResultItemBase>
}

export default SummaryResultItem
