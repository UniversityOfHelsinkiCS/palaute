import { Box } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getLanguageValue } from '../../../util/languageUtils'

import VerticalHeading from './VerticalHeading'

const ColumnHeadingsPlaceholder = () => (
  <>
    {
      /* as measured: */ [56, 56, 56, 56, 56, 108, 74, 74, 83].map((w, i) => (
        <th key={i}>
          <Box width={w} height={250} />
        </th>
      ))
    }
  </>
)

const ColumnHeadings = ({ questions, onOrderByChange }) => {
  // [questionId, isAscending] of question being sorted by
  const [orderBySelection, setOrderBySelection] = useState([null, false])
  const { t, i18n } = useTranslation()

  if (!questions) {
    return <ColumnHeadingsPlaceholder />
  }

  const questionNames = questions
    .map(({ id, data }) => ({
      id,
      question: getLanguageValue(data?.label, i18n.language),
    }))
    .concat([
      {
        id: 0,
        question: t('courseSummary:feedbackCount'),
        w: 108,
      },
      {
        id: 1,
        question: t('courseSummary:feedbackPercentage'),
        w: 74,
      },
      {
        id: 2,
        question: t('courseSummary:feedbackResponse'),
        w: 74,
      },
    ])
  return (
    <>
      {questionNames.map(({ question, id, w }) => (
        <VerticalHeading
          key={id}
          id={id}
          width={w ?? 54}
          orderBySelection={orderBySelection}
          setOrderBySelection={setOrderBySelection}
          onOrderByChange={onOrderByChange}
        >
          {question}
        </VerticalHeading>
      ))}
      <th>
        <Box width={83} height={250} />
      </th>
    </>
  )
}

export default ColumnHeadings
