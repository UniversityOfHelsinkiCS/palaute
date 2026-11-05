import { Box, Link as MuiLink, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { getLanguageValue } from '../../util/languageUtils'
import { formatDate } from '../FeedbackTarget/tabs/FeedbackView/utils'
import CourseUnitGroup from '../MyTeaching/CourseUnitGroup/CourseUnitGroup'
import CourseUnitGroupTitle from '../MyTeaching/CourseUnitGroup/CourseUnitGroupTitle'
import CourseUnitItemContainer from '../MyTeaching/CourseUnitGroup/CourseUnitItemContainer'
import { useMySurveys } from './api'

const matchesStatus = (survey, status, now = new Date()) => {
  const opensAt = new Date(survey.opensAt)
  const closesAt = new Date(survey.closesAt)
  if (status === 'upcoming') return now < opensAt
  if (status === 'ended') return closesAt <= now
  return opensAt <= now && now < closesAt
}

const closesWithin = (survey, range) => {
  const closesAt = new Date(survey.closesAt)
  return new Date(range.start) <= closesAt && closesAt <= new Date(range.end)
}

export const useMySurveysWithStatus = (status, yearRange) => {
  const { data } = useMySurveys()
  const surveys = data?.filter(s => matchesStatus(s, status) && (!yearRange || closesWithin(s, yearRange)))
  return { surveys }
}

const StandaloneSurveyGroup = ({ surveys }) => {
  const { t, i18n } = useTranslation()

  return (
    <CourseUnitGroup>
      <CourseUnitGroupTitle title={t('standaloneSurvey:groupTitle')} badgeContent={surveys.length} />
      {surveys.map(survey => (
        <CourseUnitItemContainer key={survey.id}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <MuiLink component={Link} to={`/standalone-surveys/${survey.id}`} sx={{ fontWeight: 'bold' }}>
              {getLanguageValue(survey.name, i18n.language)}
            </MuiLink>
            <Typography variant="body2" color="textSecondary">
              {t('standaloneSurvey:dates', {
                opensAt: formatDate(new Date(survey.opensAt)),
                closesAt: formatDate(new Date(survey.closesAt)),
              })}
              {' · '}
              {t('standaloneSurvey:responseCount', { count: survey.responseCount })}
            </Typography>
          </Box>
        </CourseUnitItemContainer>
      ))}
    </CourseUnitGroup>
  )
}

export default StandaloneSurveyGroup
