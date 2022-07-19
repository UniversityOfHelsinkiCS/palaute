import React from 'react'

import { Box, Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { lightFormat } from 'date-fns'
import { getLanguageValue } from '../../util/languageUtils'
import TeacherChip from '../TeacherChip'

export const CourseRealisationLabel = ({ courseRealisation, language }) => {
  const {
    startDate,
    endDate,
    feedbackTargetId,
    teachers,
    name,
    teachingLanguages,
  } = courseRealisation

  const formattedStartDate = lightFormat(new Date(startDate), 'd.M.yyyy')
  const formattedEndDate = lightFormat(new Date(endDate), 'd.M.yyyy')

  const datePeriod = `${formattedStartDate} - ${formattedEndDate}`
  const translatedName = getLanguageValue(name, language)

  const link = feedbackTargetId ? (
    <Link
      component={RouterLink}
      to={`/targets/${feedbackTargetId}/results`}
      underline="hover"
    >
      {translatedName}
    </Link>
  ) : (
    translatedName
  )

  const languagesString = teachingLanguages
    .map((teachingLanguage) => teachingLanguage[language])
    .join(', ')

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
      <Box display="flex" flexWrap="wrap" maxWidth="100rem">
        {teachers.map((t) => (
          <TeacherChip key={t.id} user={t} />
        ))}
      </Box>
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

export const OrganisationLabel = ({ name, code }) => (
  <Box display="flex" flexDirection="column">
    <Typography variant="caption" color="textSecondary">
      {code}
    </Typography>
    <Typography variant="body2">{name}</Typography>
  </Box>
)
