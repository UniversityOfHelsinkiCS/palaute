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
import { useMutation } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { useParams, Link } from 'react-router-dom'

import useOrganisationCourseUnits from '../../hooks/useOrganisationCourseUnits'
import apiClient from '../../util/apiClient'
import useOrganisation from '../../hooks/useOrganisation'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { TagChip } from '../../components/common/TagChip'
import CourseUnitTagSelector from './CourseUnitTagSelector'
import { getLanguageValue } from '../../util/languageUtils'
import queryClient from '../../util/queryClient'
import { getSafeCourseCode } from '../../util/courseIdentifiers'

const getCourseUnitItems = (courseUnits, disabledCourseCodes, studentListVisibleCourseCodes, language = 'en') =>
  (courseUnits ?? []).map(({ id, courseCode, name, tags }) => ({
    id,
    courseCode,
    name: getLanguageValue(name, language),
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
  const labelId = `courseUnitItem-${courseCode}`

  const safeCourseCode = getSafeCourseCode({ courseCode })

  return (
    <TableRow>
      <TableCell>{courseCode}</TableCell>
      <TableCell>
        <MuiLink component={Link} to={`/course-summary/course-unit/${safeCourseCode}?option=all`}>
          {name}
        </MuiLink>
      </TableCell>
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
          slotProps={{ input: { 'aria-labelledby': labelId } }}
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
            slotProps={{ input: { 'aria-labelledby': labelId } }}
            color="primary"
            disabled={disabled}
          />
        </TableCell>
      )}
    </TableRow>
  )
}

const CourseUnitTable = React.memo(
  ({ courseUnits, query, organisation, onToggleDisabledCourses, onToggleStudentListVisible, onSelect }) => {
    const { t } = useTranslation()
    const studentListVisibleFeatureEnabled = organisation.studentListVisibleByCourse

    const filteredCourseUnits = courseUnits.filter(
      ({ courseCode, name }) =>
        (courseCode ?? '').toLowerCase().includes(query) || (name ?? '').toLowerCase().includes(query)
    )

    return (
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
            {filteredCourseUnits.map(courseUnit => (
              <CourseUnitItem
                name={courseUnit.name}
                courseCode={courseUnit.courseCode}
                key={courseUnit.courseCode}
                enabledCourse={courseUnit.enabledCourse}
                studentListVisible={courseUnit.studentListVisible}
                onChangeDisabledCourses={() => onToggleDisabledCourses(courseUnit.courseCode)}
                onChangeStudentList={() => onToggleStudentListVisible(courseUnit.courseCode)}
                onSelect={() => onSelect(courseUnit)}
                organisationTags={organisation.tags}
                tags={courseUnit.tags}
                studentListVisibleFeatureEnabled={studentListVisibleFeatureEnabled}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
)

const CourseSettingsContainer = ({ organisation, courseUnits }) => {
  const { code } = organisation
  const { enqueueSnackbar } = useSnackbar()
  const mutation = useMutation({
    mutationFn: saveChangedCourseCodes,
  })
  const { t, i18n } = useTranslation()
  const [searchQuery, setSearchQuery] = React.useState('')
  const deferredQuery = React.useDeferredValue(searchQuery.toLowerCase())
  const [selectedCourse, setSelectedCourse] = React.useState(null)

  const [disabledCourseCodes, setDisabledCourseCodes] = useState(organisation.disabledCourseCodes ?? [])

  const [studentListVisibleCourseCodes, setStudentListVisibleCourseCodes] = useState(
    organisation.studentListVisibleCourseCodes ?? []
  )

  const courseUnitItems = React.useMemo(
    () => getCourseUnitItems(courseUnits, disabledCourseCodes, studentListVisibleCourseCodes, i18n.language),
    [courseUnits, disabledCourseCodes, studentListVisibleCourseCodes, i18n.language]
  )

  const onToggleDisabledCourses = React.useCallback(
    async courseCode => {
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
        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      } catch (error) {
        enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
      }
    },
    [disabledCourseCodes]
  )

  const onToggleStudentListVisible = React.useCallback(
    async courseCode => {
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
        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })

        queryClient.invalidateQueries(['organisation'])
      } catch (error) {
        enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
      }
    },
    [studentListVisibleCourseCodes]
  )

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
          <CourseUnitTable
            organisation={organisation}
            query={deferredQuery}
            courseUnits={courseUnitItems}
            onToggleDisabledCourses={onToggleDisabledCourses}
            onToggleStudentListVisible={onToggleStudentListVisible}
            onSelect={setSelectedCourse}
          />
        </CardContent>
      </Card>
    </>
  )
}

const CourseSettings = () => {
  const { code } = useParams()
  const { t } = useTranslation()

  const { courseUnits, isLoading } = useOrganisationCourseUnits(code)

  const { organisation } = useOrganisation(code)

  if (isLoading) {
    return <LoadingProgress />
  }

  return (
    <Box>
      <Typography textTransform="uppercase" sx={{ marginBottom: '10px' }}>
        {t('organisationSettings:courseSettings')}
      </Typography>
      <CourseSettingsContainer organisation={organisation} courseUnits={courseUnits} />
    </Box>
  )
}

export default CourseSettings
