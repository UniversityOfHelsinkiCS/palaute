import React from 'react'
import { Route, Switch } from 'react-router-dom'

import FeedbackList from './FeedbackList'
import FeedbackView from './FeedbackView'
import FeedbackForm from './FeedbackForm'

export default () => (
  <div className="content">
    <Switch>
      <Route path="/list" component={FeedbackList} />
      <Route path="/edit" component={FeedbackForm} />
      <Route path="/" component={FeedbackView} />
    </Switch>
  </div>
)
