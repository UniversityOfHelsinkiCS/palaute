import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { List, ListItem } from '@material-ui/core'

import {
  getMessagesAction,
  deleteMessageAction,
} from '../util/redux/messageReducer'

const FeedbackList = () => {
  const dispatch = useDispatch()

  const messages = useSelector(
    ({ api }) =>
      api?.messages?.data?.sort((a, b) => a.body.localeCompare(b.body)) ?? [],
  )

  const deleteMessage = (id) => {
    dispatch(deleteMessageAction(id))
  }

  useEffect(() => {
    dispatch(getMessagesAction())
  }, [messages.length])

  if (!messages.length) return null

  return (
    <>
      <h1>Annetut palautteet:</h1>
      <List>
        {messages.map((m) => (
          <ListItem onClick={() => deleteMessage(m.id)} key={m.id}>
            {m.body}
          </ListItem>
        ))}
      </List>
    </>
  )
}

export default FeedbackList
