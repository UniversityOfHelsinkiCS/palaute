import React from 'react'
import { Route, Switch } from 'react-router-dom'

import OrganisationSummary from './OrganisationSummary'
import CourseRealisationSummary from './CourseRealisationSummary'

const CourseSummary = () => (
  <Switch>
    <Route path="/course-summary" exact>
      <OrganisationSummary />
    </Route>

    <Route path="/course-summary/:code" exact>
      <CourseRealisationSummary />
    </Route>
  </Switch>
)

export default CourseSummary
