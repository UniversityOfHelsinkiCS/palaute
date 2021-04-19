import React, { useState } from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { Typography, CircularProgress, makeStyles } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import QuestionEditor from './QuestionEditor'
import useFeedbackTarget from '../hooks/useFeedbackTarget'
import { getLanguageValue } from '../util/languageUtils'

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(2),
  },
  progressContainer: {
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
}))

const EditFeedbackTarget = () => {
  const { feedbackTargetId } = useParams()
  const { i18n } = useTranslation()
  const classes = useStyles()

  const [questions, setQuestions] = useState([])

  const { feedbackTarget, isLoading } = useFeedbackTarget(feedbackTargetId, {
    cacheTime: 0,
  })

  if (isLoading) {
    return (
      <div className={classes.progressContainer}>
        <CircularProgress />
      </div>
    )
  }

  if (!feedbackTarget) {
    return <Redirect to="/" />
  }

  const name = getLanguageValue(feedbackTarget.name, i18n.language)

  return (
    <>
      <Typography variant="h4" component="h2" className={classes.heading}>
        {name}
      </Typography>
      <QuestionEditor questions={questions} onChange={setQuestions} />
    </>
  )
}

export default EditFeedbackTarget
