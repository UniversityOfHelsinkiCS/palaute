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
import { useParams } from 'react-router'

import apiClient from '../../util/apiClient'
import { LoadingProgress } from '../common/LoadingProgress'
import FeedbackCorrespondent from './FeedbackCorrespondent'
import CourseSettings from './CourseSettings'
import useOrganisation from '../../hooks/useOrganisation'
import Tags from './Tags'

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

  const { organisation, isLoading } = useOrganisation(code)

  if (isLoading) {
    return <LoadingProgress />
  }

  return (
    <Box>
      <GeneralSettingsContainer organisation={organisation} />
      <Box mb="5rem" />
      <FeedbackCorrespondent organisation={organisation} />
      <Box mb="5rem" />
      {organisation.tags?.length > 0 && (
        <>
          <Tags organisation={organisation} />
          <Box mb="5rem" />
        </>
      )}
      <CourseSettings />
    </Box>
  )
}

export default GeneralSettings
