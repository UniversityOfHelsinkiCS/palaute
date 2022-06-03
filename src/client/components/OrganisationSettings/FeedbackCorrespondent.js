/* eslint-disable no-alert */
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

const CorrepondentSelector = ({ handleSetAsFeedbackCorrespondent }) => {
  const [potentialUsers, setPotentialUsers] = useState([])
  const { t } = useTranslation()

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

const FeedbackCorrespondentInfo = ({
  correspondent,
  handleSetAsFeedbackCorrespondent,
}) => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          width="100%"
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <Box>
            <Typography variant="h5" component="h5">
              {t('organisationSettings:feedbackCorrespondentTab')}
            </Typography>
            <Typography variant="h6" component="h6">
              {correspondent.firstName} {correspondent.lastName}
            </Typography>
            <Typography>{correspondent.email.toLowerCase()}</Typography>
          </Box>
          <Box>
            <Button
              color="secondary"
              onClick={handleSetAsFeedbackCorrespondent(null)}
              data-cy="resetCorrespondentButton"
            >
              {t('organisationSettings:remove')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

const FeedbackCorrespondentContainer = ({ organisation }) => {
  const [correspondent, setCorrespondent] = useState(
    organisation.responsible_user,
  )
  const { code } = useParams()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const mutation = useMutation(saveFeedbackCorrespondent)
  const style = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  }

  const confirmSetCorrespondent = (user) => {
    if (!user) {
      return window.confirm(t('organisationSettings:confirmResetCorrespondent'))
    }

    const { firstName, lastName } = user
    return window.confirm(
      t('organisationSettings:confirmSetCorrespondent', {
        firstName,
        lastName,
      }),
    )
  }

  const handleSetAsFeedbackCorrespondent = (user) => async () => {
    if (!confirmSetCorrespondent(user)) return

    try {
      const updatedOrganisation = await mutation.mutateAsync({
        code,
        responsibleUserId: user ? user.id : null,
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
    <div style={style}>
      {correspondent ? (
        <FeedbackCorrespondentInfo
          correspondent={correspondent}
          handleSetAsFeedbackCorrespondent={handleSetAsFeedbackCorrespondent}
        />
      ) : (
        <Alert severity="warning">
          {t('organisationSettings:correspondentMissing')}
        </Alert>
      )}
      <Card>
        <CardContent>
          <CorrepondentSelector
            handleSetAsFeedbackCorrespondent={handleSetAsFeedbackCorrespondent}
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
