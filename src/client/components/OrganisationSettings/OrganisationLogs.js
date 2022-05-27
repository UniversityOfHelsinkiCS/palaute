import { Box } from '@material-ui/core'
import React from 'react'
import { useParams } from 'react-router'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useOrganisationLogs from '../../hooks/useOrganisationLogs'
import { LoadingProgress } from '../LoadingProgress'

const OrganisationLogs = () => {
  const { code } = useParams()
  const { organisationLogs, isLoading } = useOrganisationLogs(code)
  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()

  if (isLoading || isUserLoading) {
    return <LoadingProgress />
  }

  return <Box>Organisation logs</Box>
}

export default OrganisationLogs
