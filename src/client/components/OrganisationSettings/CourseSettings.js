import React, { useState } from 'react'

import {
  Switch,
  Box,
  Card,
  CardContent,
  TableRow,
  TableCell,
  Table,
  TableHead,
  TableBody,
  TableContainer,
  Alert,
  Typography,
  TextField,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { useSnackbar } from 'notistack'
import { useParams, Redirect } from 'react-router-dom'

import { getLanguageValue } from '../../util/languageUtils'
import useOrganisationCourseUnits from '../../hooks/useOrganisationCourseUnits'
import apiClient from '../../util/apiClient'
import useOrganisation from '../../hooks/useOrganisation'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { LoadingProgress } from '../common/LoadingProgress'
import {
  STUDENT_LIST_BY_COURSE_ENABLED,
  STUDENT_LIST_BY_COURSE_ENABLED_FOR_ADMIN,
} from '../../../config'

const getCourseUnitItems = (
  courseUnits,
  disabledCourseCodes,
  studentListVisibleCourseCodes,
  query,
  language = 'en',
) =>
  (courseUnits ?? [])
    .filter(
      ({ courseCode, name }) =>
        courseCode.includes(query) || name[language].includes(query),
    )
    .map(({ courseCode, name }) => ({
      courseCode,
      name,
      enabledCourse: !disabledCourseCodes.includes(courseCode),
      studentListVisible: studentListVisibleCourseCodes.includes(courseCode),
    }))

const saveChangedCourseCodes = async ({
  code,
  disabledCourseCodes,
  studentListVisibleCourseCodes,
}) => {
  const { data } = await apiClient.put(`/organisations/${code}`, {
    disabledCourseCodes,
    studentListVisibleCourseCodes,
  })

  return data
}

const CourseUnitItem = ({
  courseCode,
  name,
  disabled,
  enabledCourse,
  studentListVisible,
  onChangeDisabledCourses,
  onChangeStudentList,
  studentListVisibleFeatureEnabled,
}) => {
  const { i18n } = useTranslation()
  const labelId = `courseUnitItem-${courseCode}`

  const translatedLabel = `${getLanguageValue(
    name,
    i18n.language,
  )} (${courseCode})`

  return (
    <TableRow
      sx={{ '&:hover': { background: (theme) => theme.palette.action.hover } }}
    >
      <TableCell>{translatedLabel}</TableCell>
      <TableCell>
        <Switch
          edge="start"
          checked={enabledCourse}
          onChange={onChangeDisabledCourses}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': labelId }}
          color="primary"
          disabled={disabled}
        />
      </TableCell>

      {studentListVisibleFeatureEnabled && (
        <TableCell>
          <Switch
            edge="start"
            checked={studentListVisible}
            onChange={onChangeStudentList}
            tabIndex={-1}
            disableRipple
            inputProps={{ 'aria-labelledby': labelId }}
            color="primary"
            disabled={disabled}
          />
        </TableCell>
      )}
    </TableRow>
  )
}

const CourseSettingsContainer = ({
  organisation,
  courseUnits,
  t,
  language,
}) => {
  const { code } = organisation
  const { enqueueSnackbar } = useSnackbar()
  const mutation = useMutation(saveChangedCourseCodes)
  const { authorizedUser } = useAuthorizedUser()
  const [searchQuery, setSearchQuery] = useState('')

  const studentListVisibleFeatureEnabled =
    STUDENT_LIST_BY_COURSE_ENABLED.includes(organisation.code) ||
    ((STUDENT_LIST_BY_COURSE_ENABLED_FOR_ADMIN.includes(organisation.code) &&
      authorizedUser?.isAdmin) ??
      false)

  const [disabledCourseCodes, setDisabledCourseCodes] = useState(
    organisation.disabledCourseCodes ?? [],
  )

  const [studentListVisibleCourseCodes, setStudentListVisibleCourseCodes] =
    useState(organisation.studentListVisibleCourseCodes ?? [])

  const courseUnitItems = getCourseUnitItems(
    courseUnits,
    disabledCourseCodes,
    studentListVisibleCourseCodes,
    searchQuery,
    language,
  )

  const makeOnToggleDisabledCourses = (courseCode) => async () => {
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

  const makeOnToggleStudentListVisible = (courseCode) => async () => {
    const checked = studentListVisibleCourseCodes.includes(courseCode)

    const updatedStudentListVisibleCourseCodes = checked
      ? studentListVisibleCourseCodes.filter((c) => c !== courseCode)
      : [...studentListVisibleCourseCodes, courseCode]

    try {
      const updatedOrganisation = await mutation.mutateAsync({
        code,
        studentListVisibleCourseCodes: updatedStudentListVisibleCourseCodes,
      })

      setStudentListVisibleCourseCodes(
        updatedOrganisation.studentListVisibleCourseCodes,
      )
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
        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          label={t('organisationSettings:findByCourseUnit')}
          autoComplete="off"
        />
        <Box m={1} />
        <TableContainer>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('organisationSettings:course')}</TableCell>
                <TableCell>
                  {t('organisationSettings:feedbackEnabled')}
                </TableCell>
                {studentListVisibleFeatureEnabled && (
                  <TableCell>
                    {t('organisationSettings:courseStudentListVisible')}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {courseUnitItems.map(
                ({ courseCode, name, enabledCourse, studentListVisible }) => (
                  <CourseUnitItem
                    name={name}
                    courseCode={courseCode}
                    key={courseCode}
                    enabledCourse={enabledCourse}
                    studentListVisible={studentListVisible}
                    onChangeDisabledCourses={makeOnToggleDisabledCourses(
                      courseCode,
                    )}
                    onChangeStudentList={makeOnToggleStudentListVisible(
                      courseCode,
                    )}
                    disabled={mutation.isLoading}
                    studentListVisibleFeatureEnabled={
                      studentListVisibleFeatureEnabled
                    }
                  />
                ),
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

const CourseSettings = () => {
  const { code } = useParams()
  const { t, i18n } = useTranslation()

  const { courseUnits, isLoading: courseUnitsIsLoading } =
    useOrganisationCourseUnits(code)

  const { organisation, isLoading: organisationIsLoading } = useOrganisation(
    code,
    { skipCache: true },
  )

  const isLoading = courseUnitsIsLoading || organisationIsLoading

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!organisation.access.admin) {
    return <Redirect to={`/organisations/${code}/settings`} />
  }

  return (
    <Box>
      <Typography textTransform="uppercase">
        {t('organisationSettings:courseSettings')}
      </Typography>
      <CourseSettingsContainer
        organisation={organisation}
        courseUnits={courseUnits}
        t={t}
        language={i18n.language}
      />
    </Box>
  )
}

export default CourseSettings
