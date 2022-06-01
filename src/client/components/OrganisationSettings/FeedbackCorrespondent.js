import React, { useState } from 'react'

import {
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash'

import useOrganisation from '../../hooks/useOrganisation'
import { LoadingProgress } from '../LoadingProgress'
import apiClient from '../../util/apiClient'

const saveFeedbackCorrespondent = async (code, responsibleUserId) => {
  const { data } = await apiClient.put(`/organisations/${code}`, {
    responsibleUserId,
  })

  return data
}

const ResponsibleSelector = ({ code }) => {
  const { t } = useTranslation()

  const [potentialUsers, setPotentialUsers] = useState([])

  const handleChange = debounce(async ({ target }) => {
    const query = target.value
    if (query.length < 5) return

    const params = {
      email: query,
    }

    const { data } = await apiClient.get('/users', { params })
    const { persons } = data

    setPotentialUsers(persons)
  }, 400)

  const handleSetAsFeedbackCorrespondent = (user) => async () => {
    if (
      // eslint-disable-next-line no-alert
      !window.confirm(
        `Set ${user.firstName} ${user.lastName} (${user.id}) as feedback correspondent`,
      )
    )
      return

    await saveFeedbackCorrespondent(code, user.id)
  }

  return (
    <Box my={4}>
      <TextField
        style={{ width: '30em', paddingBottom: 10 }}
        label={t('organisationSettings:email')}
        variant="outlined"
        onChange={handleChange}
      />
      {potentialUsers.map((user) => (
        <Card key={user.id}>
          <CardContent>
            <b>
              {user.firstName} {user.lastName} - {user.email}
            </b>
          </CardContent>
          <CardActions>
            <Button
              onClick={handleSetAsFeedbackCorrespondent(user)}
              variant="outlined"
            >
              {t('organisationSettings:setAsCorrespondent')}
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  )
}

const FeedbackCorrespondentContainer = ({ organisation }) => {
  const { code } = organisation

  return <ResponsibleSelector code={code} />
}

const FeedbackCorrespondent = () => {
  const { code } = useParams()

  const { organisation, isLoading } = useOrganisation(code, { skipCache: true })

  if (isLoading) {
    return <LoadingProgress />
  }

  return <FeedbackCorrespondentContainer organisation={organisation} />
}

export default FeedbackCorrespondent
