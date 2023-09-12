import React from 'react'
import { useTranslation } from 'react-i18next'
import { grey } from '@mui/material/colors'

import { Box, Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { lightFormat } from 'date-fns'
import { getLanguageValue } from '../../util/languageUtils'
import TeacherChip from '../../components/common/TeacherChip'
import { getDateRangeString } from '../../util/getDateRangeString'

const TeacherChips = ({ courseRealisation }) => {
  const { t } = useTranslation()
  const responsibleTeacher = t('courseSummary:responsibleTeacher')
  const teacher = t('courseSummary:teacher')
  const administrativePerson = t('courseSummary:administrativePerson')

  const { teachers, responsibleTeachers, administrativePersons } = courseRealisation

  return (
    <Box display="flex" flexWrap="wrap" maxWidth="100rem">
      {responsibleTeachers.map(t => (
        <TeacherChip key={t.id} user={t} tooltip={responsibleTeacher} outlined style={{ backgroundColor: grey[300] }} />
      ))}

      {teachers.map(t => (
        <TeacherChip key={t.id} user={t} tooltip={teacher} style={{ backgroundColor: grey[200] }} />
      ))}

      {administrativePersons.map(t => (
        <TeacherChip
          key={t.id}
          user={t}
          tooltip={administrativePerson}
          outlined
          style={{ backgroundColor: grey[100] }}
        />
      ))}
    </Box>
  )
}

export const CourseRealisationLabel = ({ courseRealisation, language }) => {
  const { startDate, endDate, feedbackTargetId, name, teachingLanguages } = courseRealisation

  const formattedStartDate = lightFormat(new Date(startDate), 'd.M.yyyy')
  const formattedEndDate = lightFormat(new Date(endDate), 'd.M.yyyy')

  const datePeriod = `${formattedStartDate} - ${formattedEndDate}`
  const translatedName = getLanguageValue(name, language)

  const link = feedbackTargetId ? (
    <Link component={RouterLink} to={`/targets/${feedbackTargetId}/results`} underline="hover">
      {translatedName}
    </Link>
  ) : (
    translatedName
  )

  const languagesString = teachingLanguages.map(teachingLanguage => teachingLanguage[language]).join(', ')

  return (
    <>
      {link}
      <Box display="flex" alignItems="center" mb={0.5}>
        <Typography color="textSecondary" variant="body2">
          {datePeriod}
        </Typography>
        <Box mr={2} />
        <Typography color="textSecondary" variant="subtitle2">
          {languagesString}
        </Typography>
      </Box>
      <TeacherChips courseRealisation={courseRealisation} />
    </>
  )
}

export const CourseUnitLabel = ({ name, code }) => (
  <Box display="flex" flexDirection="column">
    <Typography variant="caption" color="textSecondary">
      {code}
    </Typography>
    <Typography variant="body2">{name}</Typography>
  </Box>
)

export const OrganisationLabel = ({ name, code, dates }) => (
  <Box display="flex" flexDirection="column">
    <Typography variant="caption" color="textSecondary">
      {code}
    </Typography>
    <Box display="flex" gap="1rem">
      <Typography variant="body2">{name}</Typography>
      {dates && <Typography variant="caption">({getDateRangeString(dates.startDate, dates.endDate)})</Typography>}
    </Box>
  </Box>
)
