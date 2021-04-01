import React from 'react'
import { Route, Switch } from 'react-router-dom'

import FeedbackList from './FeedbackList'
import MainView from './MainView'
import Form from './Form'
import TeacherView from './TeacherView'

export default () => (
  <div className="content">
    <Switch>
      <Route path="/view/:id" component={FeedbackList} />
      <Route path="/edit/:id" component={Form} />
      <Route path="/list" component={TeacherView} />
      <Route path="/" component={MainView} />
    </Switch>
  </div>
)
