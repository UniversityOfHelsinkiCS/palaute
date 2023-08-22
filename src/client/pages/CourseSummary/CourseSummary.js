import React from 'react'
import { Route, Switch } from 'react-router-dom'

import OrganisationSummary from './OrganisationSummary'
import CourseRealisationSummary from './CourseRealisationSummary'
import SummaryV2 from './SummaryV2/SummaryV2'

const CourseSummary = () => (
  <Switch>
    <Route path="/course-summary" exact>
      <OrganisationSummary />
    </Route>

    <Route path="/course-summary/v2" exact>
      <SummaryV2 />
    </Route>

    <Route path="/course-summary/:code" exact>
      <CourseRealisationSummary />
    </Route>
  </Switch>
)

export default CourseSummary
