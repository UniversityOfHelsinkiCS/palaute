import React from 'react'

import { Redirect } from 'react-router-dom'

const ProtectedRoute = ({ component, hasAccess, redirectPath = '/' }) => {
  if (!hasAccess) {
    return <Redirect to={redirectPath} replace />
  }

  return component()
}

export default ProtectedRoute
