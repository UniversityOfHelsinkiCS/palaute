import { useSnackbar } from 'notistack'
import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, hasAccess, notify, redirectPath = '/' }) => {
  const { enqueueSnackbar } = useSnackbar()

  if (!hasAccess && notify) {
    enqueueSnackbar(`No access to this route, sorry!`)
  }

  if (!hasAccess) {
    return <Navigate to={redirectPath} />
  }

  return children
}

export default ProtectedRoute
