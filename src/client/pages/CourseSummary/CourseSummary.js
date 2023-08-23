import React from 'react'
import { Route, Switch } from 'react-router-dom'

import OrganisationSummary from './OrganisationSummary'
import CourseRealisationSummary from './CourseRealisationSummary'
import SummaryV2 from './SummaryV2/SummaryV2'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import ProtectedRoute from '../../components/common/ProtectedRoute'

const CourseSummary = () => {
  const { authorizedUser: user } = useAuthorizedUser()

  return (
    <Switch>
      <Route path="/course-summary" exact>
        <OrganisationSummary />
      </Route>

      <ProtectedRoute path="/course-summary/v2" component={SummaryV2} hasAccess={user?.isAdmin} />

      <Route path="/course-summary/:code" exact>
        <CourseRealisationSummary />
      </Route>
    </Switch>
  )
}

export default CourseSummary
