import React, { useState } from 'react'
import { useMutation } from 'react-query'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import {
  Card,
  CardContent,
  Box,
  Switch,
  Typography,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core'

import apiClient from '../../util/apiClient'

const updateStudentListVisibility = async ({ code, studentListVisibility }) => {
  const { data } = await apiClient.put(`/organisations/${code}`, {
    studentListVisibility,
  })

  return data
}

const ProgrammeSettings = ({ programme }) => {
  const [studentListVisibility, setStudentListVisibility] = useState(
    programme.studentListVisible ?? false,
  )

  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const mutation = useMutation(updateStudentListVisibility)

  const handleVisibilityChange = async () => {
    try {
      await mutation.mutateAsync({
        code: programme.code,
        studentListVisibility,
      })

      setStudentListVisibility(!studentListVisibility)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <Card style={{ marginBottom: 10 }}>
      <CardContent>
        <Typography variant="h6" component="h1">
          {t('editProgrammeSurvey:programmeSettings')}
        </Typography>
        <Box mb={2}>
          <ListItem onClick={handleVisibilityChange} dense button>
            <ListItemIcon>
              <Switch
                edge="start"
                checked={studentListVisibility}
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': programme.code }}
                color="primary"
              />
            </ListItemIcon>
            <ListItemText
              id={programme.code}
              primary={t('editProgrammeSurvey:studentListVisible')}
            />
          </ListItem>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ProgrammeSettings
