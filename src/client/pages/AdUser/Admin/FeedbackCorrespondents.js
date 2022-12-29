import { Box, Typography } from '@mui/material'
import React from 'react'
import useQuery from '../../../hooks/useQuery'
import apiClient from '../../../util/apiClient'
import { getLanguageValue } from '../../../util/languageUtils'
import { LoadingProgress } from '../../../components/common/LoadingProgress'
import UserAccordion from './UserAccordion'
import { handleLoginAs } from './utils'

const useFeedbackCorrespondents = () =>
  useQuery('feedbackCorrespondents', async () => {
    const { data } = await apiClient.get('/admin/feedback-correspondents')
    return data
  })

const FeedbackCorrespondents = () => {
  const { data: users, isLoading } = useFeedbackCorrespondents()

  if (isLoading) return <LoadingProgress />

  return (
    <Box mt="1rem">
      {users.map((user, i) => (
        <UserAccordion
          key={`${user.id}-${i}`}
          user={user}
          handleLoginAs={handleLoginAs}
          decoration={
            <>
              <Typography color="textSecondary">
                {user.organisationCode}
              </Typography>
              <Box mr="1rem" />
              {getLanguageValue(user.organisationName, 'fi')}
            </>
          }
        />
      ))}
    </Box>
  )
}

export default FeedbackCorrespondents
