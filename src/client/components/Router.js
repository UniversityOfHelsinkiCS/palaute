import React from 'react'
import { Route, Switch } from 'react-router-dom'

import OnlyView from './OnlyView'

export default () => (
  <div className="content">
    <Switch>
      <Route path="/" component={OnlyView} />
    </Switch>
  </div>
)
