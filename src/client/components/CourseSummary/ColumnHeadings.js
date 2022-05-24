import React, { useState } from 'react'

import VerticalHeading from './VerticalHeading'

const ColumnHeadings = ({ questionNames, onOrderByChange }) => {
  const [active, setActive] = useState([null, false])

  return (
    <>
      {questionNames.map(({ question, id, index }) => (
        <VerticalHeading
          key={id}
          id={id}
          index={index}
          active={active}
          setActive={setActive}
          onOrderByChange={onOrderByChange}
        >
          {question}
        </VerticalHeading>
      ))}
    </>
  )
}

export default ColumnHeadings
