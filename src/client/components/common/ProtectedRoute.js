import React from 'react'

import { Redirect } from 'react-router-dom'

const ProtectedRoute = ({ children, hasAccess, redirectPath = '/' }) => {
  if (!hasAccess) {
    return <Redirect to={redirectPath} replace />
  }

  return children
}

export default ProtectedRoute
