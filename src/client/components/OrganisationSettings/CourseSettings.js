import React, { useState } from 'react'

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Box,
  CircularProgress,
  Card,
  CardContent,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { useSnackbar } from 'notistack'

import { getLanguageValue } from '../../util/languageUtils'
import useOrganisationCourseUnits from '../../hooks/useOrganisationCourseUnits'
import Alert from '../Alert'

const getCourseUnitItems = (courseUnits, disabledCourseCodes) =>
  (courseUnits ?? []).map(({ courseCode, name }) => ({
    id: courseCode,
    label: name,
    checked: !disabledCourseCodes.includes(courseCode),
  }))

const updateDisabledCourseCodes = async ({ code, disabledCourseCodes }) => ({
  disabledCourseCodes,
})

const CourseUnitItem = ({ id, label, disabled, checked, onChange }) => {
  const { i18n } = useTranslation()
  const labelId = `courseUnitItem-${id}`
  const translatedLabel = getLanguageValue(label, i18n.language)

  return (
    <ListItem onClick={onChange} disabled={disabled} dense button>
      <ListItemIcon>
        <Switch
          edge="start"
          checked={checked}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': labelId }}
          color="primary"
        />
      </ListItemIcon>
      <ListItemText id={labelId} primary={translatedLabel} />
    </ListItem>
  )
}

const CourseSettings = ({ organisation }) => {
  const { t } = useTranslation()
  const { code } = organisation
  const mutation = useMutation(updateDisabledCourseCodes)
  const { enqueueSnackbar } = useSnackbar()
  const { courseUnits, isLoading } = useOrganisationCourseUnits(code)

  const [disabledCourseCodes, setDisabledCourseCodes] = useState(
    organisation.disabledCourseCodes ?? [],
  )

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  const courseUnitItems = getCourseUnitItems(courseUnits, disabledCourseCodes)

  const makeOnToggle = (courseCode) => async () => {
    const checked = disabledCourseCodes.includes(courseCode)

    const updatedDisabledCourseCodes = checked
      ? disabledCourseCodes.filter((c) => c !== courseCode)
      : [...disabledCourseCodes, courseCode]

    try {
      const updatedOrganisation = await mutation.mutateAsync({
        code,
        disabledCourseCodes: updatedDisabledCourseCodes,
      })

      setDisabledCourseCodes(updatedOrganisation.disabledCourseCodes)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <Card>
      <CardContent>
        <Box mb={2}>
          <Alert severity="info">
            {t('organisationSettings:courseSettingsInfo')}
          </Alert>
        </Box>

        <List>
          {courseUnitItems.map(({ id, label, checked }) => (
            <CourseUnitItem
              label={label}
              id={id}
              key={id}
              checked={checked}
              onChange={makeOnToggle(id)}
              disabled={mutation.isLoading}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

export default CourseSettings
