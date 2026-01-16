import React from 'react'
import { useTranslation } from 'react-i18next'
import { grey } from '@mui/material/colors'

import { useIsFetching } from '@tanstack/react-query'
import { Box, CircularProgress, Link, Tooltip, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { lightFormat } from 'date-fns'
import { getLanguageValue } from '../../../util/languageUtils'
import TeacherChip from '../../../components/common/TeacherChip'
import { getDateRangeString } from '../../../util/getDateRangeString'

const TeacherChips = ({ teachers, responsibleTeachers, administrativePersons }) => {
  const { t } = useTranslation()
  const responsibleTeacher = t('courseSummary:responsibleTeacher')
  const teacher = t('courseSummary:teacher')
  const administrativePerson = t('courseSummary:administrativePerson')

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

export const FeedbackTargetLabel = ({ feedbackTarget, language }) => {
  const { startDate, endDate, name, teachingLanguages } = feedbackTarget.courseRealisation

  const formattedStartDate = lightFormat(new Date(startDate), 'd.M.yyyy')
  const formattedEndDate = lightFormat(new Date(endDate), 'd.M.yyyy')

  const datePeriod = `${formattedStartDate} - ${formattedEndDate}`
  const translatedName = getLanguageValue(name, language)

  const link = feedbackTarget ? (
    <Link variant="body2" component={RouterLink} to={`/targets/${feedbackTarget.id}/results`}>
      {translatedName}
    </Link>
  ) : (
    translatedName
  )

  const languageToFlag = language => {
    const flags = {
      fi: '🇫🇮 ',
      sv: '🇸🇪 ',
      en: '🇬🇧 ',
    }

    return flags[language] || language
  }

  const languagesString = teachingLanguages?.map(language => languageToFlag(language))

  const teachers = feedbackTarget.userFeedbackTargets
    .filter(ufbt => ufbt.accessStatus === 'TEACHER')
    .map(ufbt => ufbt.user)
  const responsibleTeachers = feedbackTarget.userFeedbackTargets
    .filter(ufbt => ufbt.accessStatus === 'RESPONSIBLE_TEACHER' && !ufbt.isAdministrativePerson)
    .map(ufbt => ufbt.user)
  const administrativePersons = feedbackTarget.userFeedbackTargets
    .filter(ufbt => ufbt.isAdministrativePerson)
    .map(ufbt => ufbt.user)

  return (
    <Box display="flex" flexDirection="column" whiteSpace="nowrap" overflow="hidden">
      <Tooltip textOverflow="ellipsis" overflow="hidden" title={translatedName} arrow>
        {link}
      </Tooltip>
      <Box display="flex" alignItems="center" mb={0.5}>
        <Typography color="textSecondary" variant="body2">
          {datePeriod}
        </Typography>
        <Box mr={2} />
        <Typography color="textSecondary" variant="subtitle2">
          {languagesString}
        </Typography>
      </Box>
      <TeacherChips
        teachers={teachers}
        responsibleTeachers={responsibleTeachers}
        administrativePersons={administrativePersons}
      />
    </Box>
  )
}

export const CourseUnitLabel = ({ name, code, extras = [] }) => (
  <Box display="flex" flexDirection="column" pl="0.5rem">
    <Box display="flex" gap="1rem" alignItems="center">
      <Typography variant="caption" color="textSecondary">
        {code}
      </Typography>
      {extras.map((extra, idx) => (
        <Typography key={idx} variant="caption" color="textSecondary">
          ({extra})
        </Typography>
      ))}
    </Box>
    <Typography variant="body2" whiteSpace="nowrap" textOverflow="ellipsis" width="20rem" overflow="hidden">
      {name}
    </Typography>
  </Box>
)

export const OrganisationLabel = ({ organisation, dates }) => {
  const { i18n } = useTranslation()
  const isFetching = useIsFetching({
    queryKey: ['summaries-v2', organisation?.id],
  })

  return (
    <Box display="flex" flexDirection="column" pl="0.5rem">
      <Typography variant="caption" color="textSecondary">
        {organisation?.code}
      </Typography>
      <Box display="flex" gap="1rem">
        <Typography variant="body2" whiteSpace="nowrap" textOverflow="ellipsis" width="20rem" overflow="hidden">
          {getLanguageValue(organisation?.name, i18n.language)}
        </Typography>
        {dates && <Typography variant="caption">({getDateRangeString(dates.startDate, dates.endDate)})</Typography>}
        {Boolean(isFetching) && <CircularProgress size={20} />}
      </Box>
    </Box>
  )
}

export const TagLabel = ({ tag, dates }) => {
  const { t, i18n } = useTranslation()
  const isFetching = useIsFetching({
    queryKey: ['summaries-v2', tag?.id],
  })

  return (
    <Box display="flex" flexDirection="column" pl="0.5rem">
      <Typography variant="caption" color="textSecondary">
        {t('courseSummary:tagLabel')}
      </Typography>
      <Box display="flex" gap="1rem">
        <Typography variant="body2" whiteSpace="nowrap" textOverflow="ellipsis" width="20rem" overflow="hidden">
          {getLanguageValue(tag?.name, i18n.language)}
        </Typography>
        {dates && <Typography variant="caption">({getDateRangeString(dates.startDate, dates.endDate)})</Typography>}
        {Boolean(isFetching) && <CircularProgress size={20} />}
      </Box>
    </Box>
  )
}
