import React, { useState } from 'react'

import {
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Box,
  CircularProgress,
} from '@material-ui/core'

import { useMutation } from 'react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import apiClient from '../../util/apiClient'
import useOrganisation from '../../hooks/useOrganisation'

const saveGeneralSettings = async ({ code, studentListVisible }) => {
  const { data } = await apiClient.put(`/organisations/${code}`, {
    studentListVisible,
  })

  return data
}

const GeneralSettingsContainer = ({ organisation }) => {
  const { t } = useTranslation()
  const { code } = organisation

  const [studentListVisible, setStudentListVisible] = useState(
    organisation?.studentListVisible ?? false,
  )

  const mutation = useMutation(saveGeneralSettings)

  const handleStudentListVisibleChange = async (event) => {
    const updatedOrganisation = await mutation.mutateAsync({
      code,
      studentListVisible: event.target.checked,
    })

    setStudentListVisible(updatedOrganisation.studentListVisible)
  }

  return (
    <Card>
      <CardContent>
        <FormControlLabel
          control={
            <Switch
              checked={studentListVisible}
              onChange={handleStudentListVisibleChange}
              color="primary"
            />
          }
          disabled={mutation.isLoading}
          label={t('organisationSettings:studentListVisible')}
        />
      </CardContent>
    </Card>
  )
}

const GeneralSettings = () => {
  const { code } = useParams()

  const { organisation, isLoading } = useOrganisation(code, { skipCache: true })

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  return <GeneralSettingsContainer organisation={organisation} />
}

export default GeneralSettings
