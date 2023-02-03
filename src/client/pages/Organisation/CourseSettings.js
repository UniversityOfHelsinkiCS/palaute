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
  IconButton,
  Link as MuiLink,
} from '@mui/material'
import { Edit } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { useSnackbar } from 'notistack'
import { useParams, Link } from 'react-router-dom'

import { getLanguageValue } from '../../util/languageUtils'
import useOrganisationCourseUnits from '../../hooks/useOrganisationCourseUnits'
import apiClient from '../../util/apiClient'
import useOrganisation from '../../hooks/useOrganisation'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { STUDENT_LIST_BY_COURSE_ENABLED } from '../../../config'
import { TagChip } from '../../components/common/TagChip'
import CourseUnitTagSelector from './CourseUnitTagSelector'

const getCourseUnitItems = (courseUnits, disabledCourseCodes, studentListVisibleCourseCodes, query, language = 'en') =>
  (courseUnits ?? [])
    .filter(({ courseCode, name }) => courseCode?.includes(query) || name[language]?.includes(query))
    .map(({ id, courseCode, name, tags }) => ({
      id,
      courseCode,
      name,
      tags,
      enabledCourse: !disabledCourseCodes.includes(courseCode),
      studentListVisible: studentListVisibleCourseCodes.includes(courseCode),
    }))

const saveChangedCourseCodes = async ({ code, disabledCourseCodes, studentListVisibleCourseCodes }) => {
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
  organisationTags,
  tags,
  onChangeDisabledCourses,
  onChangeStudentList,
  onSelect,
  studentListVisibleFeatureEnabled,
}) => {
  const { i18n } = useTranslation()
  const labelId = `courseUnitItem-${courseCode}`

  const link = (
    <MuiLink component={Link} to={`/course-summary/${courseCode}`}>
      {getLanguageValue(name, i18n.language)}
    </MuiLink>
  )

  return (
    <TableRow>
      <TableCell>{courseCode}</TableCell>
      <TableCell>{link}</TableCell>
      {organisationTags.length > 0 && (
        <TableCell>
          <Box display="flex" flexWrap="wrap">
            {tags.map(tag => (
              <TagChip tag={tag} key={tag.id} />
            ))}
            <IconButton onClick={onSelect}>
              <Edit />
            </IconButton>
          </Box>
        </TableCell>
      )}

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

const CourseSettingsContainer = ({ organisation, courseUnits, t, language }) => {
  const { code } = organisation
  const { enqueueSnackbar } = useSnackbar()
  const mutation = useMutation(saveChangedCourseCodes)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCourse, setSelectedCourse] = React.useState(null)

  const studentListVisibleFeatureEnabled = STUDENT_LIST_BY_COURSE_ENABLED.includes(organisation.code)

  const [disabledCourseCodes, setDisabledCourseCodes] = useState(organisation.disabledCourseCodes ?? [])

  const [studentListVisibleCourseCodes, setStudentListVisibleCourseCodes] = useState(
    organisation.studentListVisibleCourseCodes ?? []
  )

  const courseUnitItems = getCourseUnitItems(
    courseUnits,
    disabledCourseCodes,
    studentListVisibleCourseCodes,
    searchQuery,
    language
  )

  const makeOnToggleDisabledCourses = courseCode => async () => {
    const checked = disabledCourseCodes.includes(courseCode)

    const updatedDisabledCourseCodes = checked
      ? disabledCourseCodes.filter(c => c !== courseCode)
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

  const makeOnToggleStudentListVisible = courseCode => async () => {
    const checked = studentListVisibleCourseCodes.includes(courseCode)

    const updatedStudentListVisibleCourseCodes = checked
      ? studentListVisibleCourseCodes.filter(c => c !== courseCode)
      : [...studentListVisibleCourseCodes, courseCode]

    try {
      const updatedOrganisation = await mutation.mutateAsync({
        code,
        studentListVisibleCourseCodes: updatedStudentListVisibleCourseCodes,
      })

      setStudentListVisibleCourseCodes(updatedOrganisation.studentListVisibleCourseCodes)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <>
      <CourseUnitTagSelector
        courseUnit={selectedCourse}
        organisation={organisation}
        onClose={() => setSelectedCourse(null)}
      />

      <Card>
        <CardContent>
          <Box mb={2}>
            <Alert severity="info">{t('organisationSettings:courseSettingsInfo')}</Alert>
          </Box>
          <TextField
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            label={t('organisationSettings:findByCourseUnit')}
            autoComplete="off"
          />
          <Box m={1} />
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('common:courseCode')}</TableCell>
                  <TableCell>{t('common:course')}</TableCell>
                  {organisation.tags.length > 0 && <TableCell>{t('common:studyTracks')}</TableCell>}
                  <TableCell>{t('organisationSettings:feedbackEnabled')}</TableCell>
                  {studentListVisibleFeatureEnabled && (
                    <TableCell>{t('organisationSettings:courseStudentListVisible')}</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {courseUnitItems.map(courseUnit => (
                  <CourseUnitItem
                    name={courseUnit.name}
                    courseCode={courseUnit.courseCode}
                    key={courseUnit.courseCode}
                    enabledCourse={courseUnit.enabledCourse}
                    studentListVisible={courseUnit.studentListVisible}
                    onChangeDisabledCourses={makeOnToggleDisabledCourses(courseUnit.courseCode)}
                    onChangeStudentList={makeOnToggleStudentListVisible(courseUnit.courseCode)}
                    onSelect={() => setSelectedCourse(courseUnit)}
                    organisationTags={organisation.tags}
                    tags={courseUnit.tags}
                    disabled={mutation.isLoading}
                    studentListVisibleFeatureEnabled={studentListVisibleFeatureEnabled}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  )
}

const CourseSettings = () => {
  const { code } = useParams()
  const { t, i18n } = useTranslation()

  const { courseUnits, isLoading } = useOrganisationCourseUnits(code)

  const { organisation } = useOrganisation(code)

  if (isLoading) {
    return <LoadingProgress />
  }

  return (
    <Box>
      <Typography textTransform="uppercase">{t('organisationSettings:courseSettings')}</Typography>
      <CourseSettingsContainer organisation={organisation} courseUnits={courseUnits} t={t} language={i18n.language} />
    </Box>
  )
}

export default CourseSettings
