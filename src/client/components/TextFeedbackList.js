import React from 'react'
import { useTranslation } from 'react-i18next'
import { List, ListItem } from '@material-ui/core'

const TextFeebackList = ({ answers }) => {
  const { t } = useTranslation()

  const filteredAnswers = answers.filter(
    (feedback) => feedback !== undefined && feedback !== '',
  )

  if (filteredAnswers.length === 0) {
    return <p>{t('feedbackList:notEnoughFeedbacks')}</p>
  }

  return (
    <div>
      {t('feedbackList:answers')}: {filteredAnswers.length} <br />
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
