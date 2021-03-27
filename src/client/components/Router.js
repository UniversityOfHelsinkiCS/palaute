import React from 'react'
import { Route, Switch } from 'react-router-dom'

import FeedbackView from './FeedbackView'

export default () => (
  <div className="content">
    <Switch>
      <Route path="/" component={FeedbackView} />
    </Switch>
  </div>
)
