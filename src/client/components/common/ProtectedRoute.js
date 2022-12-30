import React from 'react'

import { Redirect, Route } from 'react-router-dom'

const ProtectedRoute = ({ path, component, hasAccess, redirectPath = '/' }) => {
  const componentToRender = hasAccess
    ? component
    : () => <Redirect to={redirectPath} />

  return <Route path={path} component={componentToRender} />
}

export default ProtectedRoute
