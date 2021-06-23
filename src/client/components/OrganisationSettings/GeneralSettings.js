import React, { useState } from 'react'
import { Card, CardContent, Switch, FormControlLabel } from '@material-ui/core'

import { useMutation, useQueryClient } from 'react-query'
import { useTranslation } from 'react-i18next'

import apiClient from '../../util/apiClient'

const saveGeneralSettings = async ({ code, studentListVisible }) => {
  const { data } = await apiClient.put(`/organisations/${code}`, {
    studentListVisible,
  })

  return data
}

const GeneralSettings = ({ organisation }) => {
  const { code } = organisation
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [studentListVisible, setStudentListVisible] = useState(
    organisation?.studentListVisible ?? false,
  )

  const mutation = useMutation(saveGeneralSettings, {
    onSuccess: () => {
      queryClient.invalidateQueries(['organisation', code])
    },
  })

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

export default GeneralSettings
