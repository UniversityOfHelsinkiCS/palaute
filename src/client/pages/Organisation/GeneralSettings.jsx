import React, { useState } from 'react'

import {
  Card,
  CardContent,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  Alert,
  Box,
  Typography,
  Stack,
} from '@mui/material'

import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { getStudentListVisibility } from './utils'
import apiClient from '../../util/apiClient'
import queryClient from '../../util/queryClient'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import FeedbackCorrespondent from './FeedbackCorrespondent'
import CourseSettings from './CourseSettings'
import useOrganisation from '../../hooks/useOrganisation'
import Tags from './Tags'
import { ENABLE_CORRESPONDENT_MANAGEMENT } from '../../util/common'

const saveGeneralSettings = async ({ code, studentListVisible, studentListVisibleByCourse }) => {
  const { data } = await apiClient.put(`/organisations/${code}`, {
    studentListVisible,
    studentListVisibleByCourse,
  })

  return data
}

const StudentListSettings = ({ organisation }) => {
  const { t } = useTranslation()
  const { code } = organisation

  const [visibility, setVisibility] = useState(getStudentListVisibility(organisation))

  const mutation = useMutation({
    mutationFn: saveGeneralSettings,
  })

  const handleChange = async ({ target }) => {
    const studentListVisible = target.value === 'visible'
    const studentListVisibleByCourse = target.value === 'byCourse'

    await mutation.mutateAsync({
      code,
      studentListVisible,
      studentListVisibleByCourse,
    })

    queryClient.invalidateQueries(['organisation', code])
    setVisibility(target.value)
  }

  return (
    <Card>
      <CardContent>
        <Typography mb={2} textTransform="uppercase">
          {t('organisationSettings:studentListVisibility')}
        </Typography>
        <Alert severity="info">{t('organisationSettings:studentListVisibilityInfo')}</Alert>

        <Box mt={2}>
          <FormControl>
            <RadioGroup value={visibility} onChange={handleChange}>
              <FormControlLabel
                value="visible"
                control={<Radio />}
                label={t('organisationSettings:studentListVisible')}
              />
              <FormControlLabel
                value="hidden"
                control={<Radio />}
                label={t('organisationSettings:studentListHidden')}
              />
              <FormControlLabel
                value="byCourse"
                control={<Radio />}
                label={t('organisationSettings:studentListByCourse')}
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  )
}

const GeneralSettingsContainer = ({ organisation }) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography textTransform="uppercase" sx={{ marginBottom: '10px' }}>
        {t('organisationSettings:generalSettings')}
      </Typography>
      <StudentListSettings organisation={organisation} />
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
    <Stack spacing={6}>
      {ENABLE_CORRESPONDENT_MANAGEMENT && <FeedbackCorrespondent organisation={organisation} />}
      <GeneralSettingsContainer organisation={organisation} />
      <CourseSettings />
      {organisation.tags?.length > 0 && <Tags organisation={organisation} />}
    </Stack>
  )
}

export default GeneralSettings
