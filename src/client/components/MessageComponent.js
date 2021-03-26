import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Input, Button, List, ListItem } from '@material-ui/core'

import {
  postMessageAction,
  getMessagesAction,
  deleteMessageAction,
} from '../util/redux/messageReducer'

const MessageComponent = () => {
  const dispatch = useDispatch()
  const [message, setMessage] = useState('')
  const messages = useSelector(({ api }) =>
      api?.messages?.data?.sort((a, b) => a.body.localeCompare(b.body)) ?? [],
  )

  const postMessage = () => {
    const response = dispatch(postMessageAction({ message }))
    setMessage('')
  }

  const deleteMessage = (id) => {
    const res = dispatch(deleteMessageAction(id))
  }

  useEffect(() => {
    dispatch(getMessagesAction())
  }, [messages.length])

  return (
    <div style={{ paddingTop: '1em' }}>
      <Input
        id="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={() => postMessage()}>
        Send!
      </Button>
      <List>
        {messages.map((m) => (
          <ListItem onClick={() => deleteMessage(m.id)} key={m.id}>
            {m.body}
          </ListItem>
        ))}
      </List>
    </div>
  )
}

export default MessageComponent
