import React, { useState } from 'react'

import {
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Box,
  Typography,
} from '@mui/material'

import { useMutation } from 'react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import apiClient from '../../util/apiClient'
import useOrganisation from '../../hooks/useOrganisation'
import { LoadingProgress } from '../LoadingProgress'
import FeedbackCorrespondent from './FeedbackCorrespondent'
import CourseSettings from './CourseSettings'

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
    <Box>
      <Typography textTransform="uppercase">
        {t('organisationSettings:generalSettings')}
      </Typography>
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
    </Box>
  )
}

const GeneralSettings = () => {
  const { code } = useParams()

  const { organisation, isLoading } = useOrganisation(code, { skipCache: true })

  if (isLoading) {
    return <LoadingProgress />
  }

  return (
    <Box>
      <GeneralSettingsContainer organisation={organisation} />
      <Box mb="5rem" />
      <FeedbackCorrespondent organisation={organisation} />
      <Box mb="5rem" />
      <CourseSettings />
    </Box>
  )
}

export default GeneralSettings
