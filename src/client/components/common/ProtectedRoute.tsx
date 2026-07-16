import { useSnackbar } from 'notistack'
import React from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
  hasAccess: boolean
  notify?: boolean
  redirectPath?: string
}

const ProtectedRoute = ({ children, hasAccess, notify, redirectPath = '/' }: ProtectedRouteProps) => {
  const { enqueueSnackbar } = useSnackbar()

  if (!hasAccess && notify) {
    enqueueSnackbar('No access to this route, sorry!')
  }

  if (!hasAccess) {
    return <Navigate to={redirectPath} />
  }

  return children
}

export default ProtectedRoute
