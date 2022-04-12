import React from 'react'
import VerticalHeading from './VerticalHeading'

const ColumnHeadings = ({ questionNames }) => (
  <>
    {questionNames.map(({ question, id }) => (
      <VerticalHeading key={id}>{question}</VerticalHeading>
    ))}
  </>
)

export default ColumnHeadings
