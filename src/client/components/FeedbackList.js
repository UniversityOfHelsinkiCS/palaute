import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { List, ListItem } from '@material-ui/core'

import { getAllFeedbackAction } from '../util/redux/feedbackReducer'

const FeedbackList = () => {
  const dispatch = useDispatch()

  const feedbacks = useSelector((state) => state.feedback.data)

  useEffect(() => {
    dispatch(getAllFeedbackAction())
  }, [feedbacks.length])

  if (!feedbacks.length) return null

  return (
    <>
      <h1>Annetut palautteet:</h1>
      <List>
        {feedbacks.map((m) => (
          <ListItem key={m.id}>{JSON.stringify(m.data)}</ListItem>
        ))}
      </List>
    </>
  )
}

export default FeedbackList
