import { React } from 'react'

import { Box, Typography } from '@mui/material'

import useFeedbackTargetUsers from '../../../../hooks/useFeedbackTargetUsers'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import useFeedbackTargetId from '../../useFeedbackTargetId'

const Links = () => {
  const id = useFeedbackTargetId()

  const { isLoading, users } = useFeedbackTargetUsers(id)

  if (isLoading) {
    return <LoadingProgress />
  }

  const sortedUsers = users.sort((a, b) => a.lastName?.localeCompare(b.lastName) ?? 0)

  return (
    <Box id="feedback-target-tab-content">
      <Typography variant="h6">Students and their respective feedback links</Typography>
      {sortedUsers.map(user => (
        <Box key={user.studentNumber} style={{ marginTop: 5 }}>
          <Typography variant="body1" component="p">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body2" component="p" data-cy={`noad-token-${user.studentNumber}`}>
            http://{window.location.host}/noad/token/{user.token}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export default Links
