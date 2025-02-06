import React, { useState } from 'react'

import { TextField, Card, CardContent, Box, Typography, Alert, List, ListItem, ListItemText } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useMutation, useQueryClient } from 'react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash-es'

import useOrganisation from '../../hooks/useOrganisation'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import apiClient from '../../util/apiClient'
import { NorButton } from '../../components/common/NorButton'

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

const CorrepondentSelector = ({ add, query, setQuery, potentialUsers, setPotentialUsers }) => {
  const { t } = useTranslation()

  const updateUsers = debounce(async query => {
    if (query.length < 5) {
      setPotentialUsers([])
      return
    }

    const params = {
      user: query,
      isEmployee: true,
    }

    const { data } = await apiClient.get('/users', { params })
    const { persons } = data

    setPotentialUsers(persons)
  }, 400)

  const handleChange = ({ target }) => {
    setQuery(target.value)
    updateUsers(target.value)
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="body1">{t('organisationSettings:newCorrespondent')}</Typography>
          <Box mb={2} />
          <TextField
            style={{ width: '100%', paddingBottom: 10 }}
            label={t('organisationSettings:searchUser')}
            value={query}
            variant="outlined"
            onChange={handleChange}
            type="text"
          />
        </CardContent>
        {potentialUsers.length > 0 && (
          <List
            sx={{
              width: '100%',
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'auto',
              maxHeight: 300,
              mb: 2,
            }}
          >
            {potentialUsers.map(user => (
              <ListItem key={`user-${user.id}`}>
                <ListItemText
                  primary={`${user.firstName} ${user.lastName} - ${user.email}`}
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />

                <NorButton onClick={() => add(user)} color="secondary">
                  {t('organisationSettings:setAsCorrespondent')}
                </NorButton>
              </ListItem>
            ))}
          </List>
        )}
      </Card>
    </Box>
  )
}

const FeedbackCorrespondentInfo = ({ correspondent, remove }) => {
  const { t } = useTranslation()
  const isAutomatic = !correspondent.OrganisationFeedbackCorrespondent?.userCreated
  const createdAt = new Date(correspondent.OrganisationFeedbackCorrespondent?.createdAt)

  return (
    <Card>
      <CardContent>
        <Box display="flex" width="100%" justifyContent="space-between" alignItems="flex-start">
          <Box m={1}>
            <Typography variant="body1">
              {correspondent.firstName} {correspondent.lastName}
            </Typography>
            <Typography>{correspondent.email?.toLowerCase()}</Typography>
            <Typography variant="body2">{createdAt.toLocaleDateString()}</Typography>
          </Box>
          <Box display="flex" flexDirection="column" justifyContent="space-between" alignItems="flex-end">
            <NorButton color="error" onClick={() => remove(correspondent)} data-cy="resetCorrespondentButton">
              {t('organisationSettings:remove')}
            </NorButton>
            <Typography variant="body2" mt="1rem">
              {isAutomatic ? t('organisationSettings:basedOnIam') : t('organisationSettings:addedInNorppa')}
            </Typography>
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
  const [query, setQuery] = useState('')
  const [potentialUsers, setPotentialUsers] = useState([])

  const mutation = useMutation(updateFeedbackCorrespondents(code), {
    onSuccess: data => {
      queryClient.setQueryData(['organisation', code], organisation => ({
        ...organisation,
        users: data,
      }))
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    },
    onError: () => {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
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
    setQuery('')
    setPotentialUsers([])
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
          <FeedbackCorrespondentInfo correspondent={correspondent} remove={remove} key={correspondent.id} />
        ))
      ) : (
        <Alert severity="warning">{t('organisationSettings:correspondentMissing')}</Alert>
      )}
      <CorrepondentSelector
        add={add}
        query={query}
        setQuery={setQuery}
        potentialUsers={potentialUsers}
        setPotentialUsers={setPotentialUsers}
      />
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
