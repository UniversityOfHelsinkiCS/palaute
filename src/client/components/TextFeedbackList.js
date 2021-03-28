import React from 'react'
import { List, ListItem } from '@material-ui/core'

const TextFeebackList = ({ question, answers }) => {
  if (answers.length === 0) {
    return null
  }

  return (
    <div>
      <h4>{question.question.fi}</h4>
      Vastauksia: {answers.length} <br />
      <List>
        {answers.map((answer) => (
          // TODO use some acually unique key
          <ListItem key={answer}>{answer}</ListItem>
        ))}
      </List>
    </div>
  )
}

export default TextFeebackList
