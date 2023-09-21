import React from 'react'
import { Route, Switch } from 'react-router-dom'

import OrganisationSummary from './OrganisationSummary'
import CourseRealisationSummary from './CourseRealisationSummary'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import { inProduction } from '../../util/common'
import MyOrganisations from './SummaryV2/MyOrganisations'
import { SummaryContextProvider } from './SummaryV2/context'
import University from './SummaryV2/University'

const CourseSummary = () => {
  const { authorizedUser: user } = useAuthorizedUser()

  return (
    <SummaryContextProvider>
      <Switch>
        <Route path="/course-summary" exact>
          <OrganisationSummary />
        </Route>

        <ProtectedRoute
          path="/course-summary/v2/my-organisations"
          component={MyOrganisations}
          hasAccess={
            // TODO: do not use HY specific special groups
            !inProduction ||
            user.isAdmin ||
            user?.specialGroup?.allProgrammes ||
            user?.specialGroup?.hyOne ||
            user?.specialGroup?.admin
          }
        />

        <ProtectedRoute
          path="/course-summary/v2/university"
          component={University}
          hasAccess={
            // TODO: do not use HY specific special groups
            !inProduction ||
            user.isAdmin ||
            user?.specialGroup?.allProgrammes ||
            user?.specialGroup?.hyOne ||
            user?.specialGroup?.admin
          }
        />

        <Route path="/course-summary/:code" exact>
          <CourseRealisationSummary />
        </Route>
      </Switch>
    </SummaryContextProvider>
  )
}

export default CourseSummary
