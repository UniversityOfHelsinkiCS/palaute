import React, { useState } from 'react'

import {
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Typography,
} from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { useMutation } from 'react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash'

import useOrganisation from '../../hooks/useOrganisation'
import { LoadingProgress } from '../LoadingProgress'
import Alert from '../Alert'
import apiClient from '../../util/apiClient'

const saveFeedbackCorrespondent = async ({ code, responsibleUserId }) => {
  const { data } = await apiClient.put(`/organisations/${code}`, {
    responsibleUserId,
  })

  return data
}

const CorrepondentSelector = ({ code, setCorrespondent }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const [potentialUsers, setPotentialUsers] = useState([])
  const mutation = useMutation(saveFeedbackCorrespondent)

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
    const { firstName, lastName } = user
    if (
      // eslint-disable-next-line no-alert
      !window.confirm(
        t('organisationSettings:confirmSetCorrespondent', {
          firstName,
          lastName,
        }),
      )
    )
      return

    try {
      const updatedOrganisation = await mutation.mutateAsync({
        code,
        responsibleUserId: user.id,
      })
      setCorrespondent(updatedOrganisation.responsible_user)
      enqueueSnackbar(t('organisationSettings:setCorrespondentSuccess'), {
        variant: 'success',
      })
    } catch {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <Box my={4}>
      <Typography variant="h6" component="h6">
        {t('organisationSettings:newCorrespondent')}
      </Typography>
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

const FeedbackCorrespondentInfo = ({ correspondent }) => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h5">
          {t('organisationSettings:feedbackCorrespondentTab')}
        </Typography>
        <Typography variant="h6" component="h6">
          {correspondent.firstName} {correspondent.lastName}
        </Typography>
        <Typography>{correspondent.email.toLowerCase()}</Typography>
      </CardContent>
    </Card>
  )
}

const FeedbackCorrespondentContainer = ({ organisation }) => {
  const [correspondent, setCorrespondent] = useState(
    organisation.responsible_user,
  )
  const { t } = useTranslation()
  const { code } = useParams()
  const style = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  }

  return (
    <div style={style}>
      {correspondent ? (
        <FeedbackCorrespondentInfo correspondent={correspondent} />
      ) : (
        <Alert severity="warning">
          {t('organisationSettings:correspondentMissing')}
        </Alert>
      )}
      <Card>
        <CardContent>
          <CorrepondentSelector
            code={code}
            setCorrespondent={setCorrespondent}
          />
        </CardContent>
      </Card>
    </div>
  )
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
