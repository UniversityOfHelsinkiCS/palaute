import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Input, Button } from '@material-ui/core'
import FeedbackList from './FeedbackList'

import { postMessageAction } from '../util/redux/messageReducer'

const MessageComponent = () => {
  const dispatch = useDispatch()
  const [message, setMessage] = useState('')

  const postMessage = () => {
    dispatch(postMessageAction({ message }))
    setMessage('')
  }

  return (
    <div style={{ paddingTop: '1em' }}>
      <Input
        id="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={() => postMessage()}>
        Anna palautetta!
      </Button>
      <FeedbackList />
    </div>
  )
}

export default MessageComponent
