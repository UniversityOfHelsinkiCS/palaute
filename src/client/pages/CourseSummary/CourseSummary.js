import React from 'react'
import { Route, Switch } from 'react-router-dom'

import OrganisationSummary from './OrganisationSummary'
import CourseRealisationSummary from './CourseRealisationSummary'
import { SummaryContextProvider } from './SummaryV2/context'
import Summary from './SummaryV2/Summary'

const CourseSummary = () => (
  <SummaryContextProvider>
    <Switch>
      <Route path="/course-summary" exact>
        <OrganisationSummary />
      </Route>

      <Route path="/course-summary/v2">
        <Summary />
      </Route>

      <Route path="/course-summary/:code" exact>
        <CourseRealisationSummary />
      </Route>
    </Switch>
  </SummaryContextProvider>
)

export default CourseSummary
