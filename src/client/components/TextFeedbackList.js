import React from 'react'
import { List, ListItem } from '@material-ui/core'

const TextFeebackList = ({ answers }) => {
  const filteredAnswers = answers.filter(
    (feedback) => feedback !== undefined && feedback !== '',
  )

  if (filteredAnswers.length === 0) {
    return <p>Palautteita on liian vähän näytettäväksi</p>
  }

  return (
    <div>
      Vastauksia: {filteredAnswers.length} <br />
      <List>
        {filteredAnswers.map((answer) => (
          // TODO use some acually unique key
          <ListItem key={answer}>{answer}</ListItem>
        ))}
      </List>
    </div>
  )
}

export default TextFeebackList
