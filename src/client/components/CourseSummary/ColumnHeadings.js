import React, { useState } from 'react'

import VerticalHeading from './VerticalHeading'

const ColumnHeadings = ({ questionNames, onOrderByChange }) => {
  // [questionId, isAscending] of question being sorted by
  const [orderBySelection, setOrderBySelection] = useState([null, false])

  return (
    <>
      {questionNames.map(({ question, id }) => (
        <VerticalHeading
          key={id}
          id={id}
          orderBySelection={orderBySelection}
          setOrderBySelection={setOrderBySelection}
          onOrderByChange={onOrderByChange}
        >
          {question}
        </VerticalHeading>
      ))}
    </>
  )
}

export default ColumnHeadings
