/* eslint-disable no-alert */
import React, { useState } from 'react'

import { TextField, Card, CardContent, CardActions, Button, Box, Typography, Alert } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useMutation, useQueryClient } from 'react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash'

import useOrganisation from '../../../hooks/useOrganisation'
import { LoadingProgress } from '../../../components/common/LoadingProgress'
import apiClient from '../../../util/apiClient'

const updateFeedbackCorrespondents =
  code =>
  async ({ userId, add }) => {
    if (add) {
      const { data } = await apiClient.post(`/organisations/${code}/feedback-correspondents`, {
        userId,
      })
      return data
    }
    const { data } = await apiClient.delete(`/organisations/${code}/feedback-correspondents/${userId}`)
    return data
  }

const CorrepondentSelector = ({ add }) => {
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
    <Box>
      <Card>
        <CardContent>
          <Typography variant="body1">{t('organisationSettings:newCorrespondent')}</Typography>
          <Box mb={2} />
          <TextField
            style={{ width: '30em', paddingBottom: 10 }}
            label={t('organisationSettings:email')}
            variant="outlined"
            onChange={handleChange}
          />
        </CardContent>
      </Card>
      <Box my={1} />
      {potentialUsers.map(user => (
        <>
          <Card key={user.id}>
            <CardContent>
              <b>
                {user.firstName} {user.lastName} - {user.email}
              </b>
            </CardContent>
            <CardActions>
              <Button onClick={() => add(user)} variant="outlined">
                {t('organisationSettings:setAsCorrespondent')}
              </Button>
            </CardActions>
          </Card>
          <Box mb={1} />
        </>
      ))}
    </Box>
  )
}

const FeedbackCorrespondentInfo = ({ correspondent, remove }) => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardContent>
        <Box display="flex" width="100%" justifyContent="space-between" alignItems="flex-end">
          <Box m={1}>
            <Typography variant="body1">
              {correspondent.firstName} {correspondent.lastName}
            </Typography>
            <Typography>{correspondent.email.toLowerCase()}</Typography>
          </Box>
          <Box>
            <Button color="secondary" onClick={() => remove(correspondent)} data-cy="resetCorrespondentButton">
              {t('organisationSettings:remove')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

const FeedbackCorrespondentContainer = ({ feedbackCorrespondents }) => {
  const { code } = useParams()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const mutation = useMutation(updateFeedbackCorrespondents(code), {
    onSuccess: data => {
      queryClient.setQueryData(['organisation', code], organisation => ({
        ...organisation,
        users: data,
      }))
    },
    onError: () => {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    },
  })

  const style = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  }

  const confirmChange = (user, add = true) => {
    const { firstName, lastName } = user

    if (!add) {
      return window.confirm(
        t('organisationSettings:confirmResetCorrespondent', {
          firstName,
          lastName,
        })
      )
    }

    return window.confirm(
      t('organisationSettings:confirmSetCorrespondent', {
        firstName,
        lastName,
      })
    )
  }

  const add = async user => {
    if (!confirmChange(user, true)) return
    await mutation.mutateAsync({ userId: user.id, add: true })
  }

  const remove = async user => {
    if (!confirmChange(user, false)) return
    await mutation.mutateAsync({ userId: user.id, add: false })
  }

  return (
    <div style={style}>
      <Typography textTransform="uppercase">
        {t('organisationSettings:feedbackCorrespondents')} ({feedbackCorrespondents?.length})
      </Typography>
      {feedbackCorrespondents?.length > 0 ? (
        feedbackCorrespondents.map(correspondent => (
          <FeedbackCorrespondentInfo correspondent={correspondent} remove={remove} />
        ))
      ) : (
        <Alert severity="warning">{t('organisationSettings:correspondentMissing')}</Alert>
      )}
      <CorrepondentSelector add={add} />
    </div>
  )
}

const FeedbackCorrespondent = () => {
  const { code } = useParams()

  const { organisation, isLoading } = useOrganisation(code)

  if (isLoading) {
    return <LoadingProgress />
  }

  return <FeedbackCorrespondentContainer feedbackCorrespondents={organisation.users} />
}

export default FeedbackCorrespondent
