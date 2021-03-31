import React from 'react'
import { Route, Switch } from 'react-router-dom'

import FeedbackList from './FeedbackList'
import MainView from './MainView'
import Form from './Form'

export default () => (
  <div className="content">
    <Switch>
      <Route path="/view/:id" component={FeedbackList} />
      <Route path="/edit/:id" component={Form} />
      <Route path="/" component={MainView} />
    </Switch>
  </div>
)
