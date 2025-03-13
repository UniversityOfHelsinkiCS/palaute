import { Box, Chip, Typography } from '@mui/material'
import React from 'react'
import useQuery from '../../../../hooks/useQuery'
import apiClient from '../../../../util/apiClient'
import { getLanguageValue } from '../../../../util/languageUtils'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import UserAccordion from '../../UserAccordion/UserAccordion'
import { handleLoginAs } from '../../utils'

const useFeedbackCorrespondents = () =>
  useQuery({
    queryKey: ['feedbackCorrespondents'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/feedback-correspondents')
      return data
    },
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
            <Box display="flex" width="100%" alignItems="center">
              <Typography color="textSecondary">{user.organisationCode}</Typography>
              <Box mr="1rem" />
              {getLanguageValue(user.organisationName, 'fi')}
              <Chip
                sx={{ ml: 'auto' }}
                label={user.userCreated ? 'Manual' : 'IAM'}
                color={user.userCreated ? 'primary' : 'secondary'}
                variant="outlined"
              />
            </Box>
          }
        />
      ))}
    </Box>
  )
}

export default FeedbackCorrespondents
