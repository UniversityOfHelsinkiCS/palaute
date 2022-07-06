import { React } from 'react'

import { Box, Typography } from '@mui/material'
import { Redirect, useParams } from 'react-router'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useFeedbackTargetUsers from '../../hooks/useFeedbackTargetUsers'
import { LoadingProgress } from '../LoadingProgress'

const FeedbackLinksView = () => {
  const { id } = useParams()

  const { authorizedUser } = useAuthorizedUser()
  const isAdminUser = authorizedUser?.isAdmin ?? false

  if (!isAdminUser) {
    return <Redirect to="/" />
  }

  const { isLoading, users } = useFeedbackTargetUsers(id)

  if (isLoading) {
    return <LoadingProgress />
  }

  const sortedUsers = users.sort((a, b) =>
    a.firstName.localeCompare(b.firstName),
  )

  return (
    <Box>
      <Typography variant="h6">
        Students and their respective feedback links
      </Typography>
      {sortedUsers.map((user) => (
        <Box key={user.studentNumber} style={{ marginTop: 5 }}>
          <Typography variant="body1" component="p">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body2" component="p">
            http://coursefeedback.helsinki.fi/noad/token/{user.token}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export default FeedbackLinksView
