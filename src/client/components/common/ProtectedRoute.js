import { useSnackbar } from 'notistack'
import React from 'react'

import { Redirect, Route } from 'react-router-dom'

const ProtectedRoute = ({ path, component, hasAccess, notify, redirectPath = '/' }) => {
  const { enqueueSnackbar } = useSnackbar()
  if (!hasAccess && notify) {
    enqueueSnackbar(`No access to ${path}, sorry!`)
  }

  const componentToRender = hasAccess ? component : () => <Redirect to={redirectPath} />

  return <Route path={path} component={componentToRender} />
}

export default ProtectedRoute
