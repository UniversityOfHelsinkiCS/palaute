import { Box, Card, CardContent, List, ListItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { NorButton } from '../../components/common/NorButton'
import { getLanguageValue } from '../../util/languageUtils'
import { formatDate } from '../FeedbackTarget/tabs/FeedbackView/utils'
import { useAnsweredSurveys } from './api'

export const useAnsweredSurveysWithStatus = status => {
  const { data } = useAnsweredSurveys()
  const now = new Date()
  const isEnded = survey => new Date(survey.closesAt) <= now
  if (status === 'given') return (data ?? []).filter(s => !isEnded(s))
  if (status === 'ended') return (data ?? []).filter(isEnded)
  return []
}

const AnsweredSurveys = ({ surveys }) => {
  const { t, i18n } = useTranslation()

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        {t('standaloneSurvey:answeredGroupTitle')}
      </Typography>
      <Card>
        <CardContent>
          <List disablePadding>
            {surveys.map((survey, index) => {
              const ended = new Date(survey.closesAt) <= new Date()
              return (
                <ListItem
                  key={survey.token}
                  divider={index < surveys.length - 1}
                  sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', px: 0 }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 'bold' }}>{getLanguageValue(survey.name, i18n.language)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('standaloneSurvey:dates', {
                        opensAt: formatDate(new Date(survey.opensAt)),
                        closesAt: formatDate(new Date(survey.closesAt)),
                      })}
                    </Typography>
                  </Box>
                  <NorButton
                    color="secondary"
                    component={Link}
                    to={ended ? `/survey/${survey.token}/results` : `/survey/${survey.token}`}
                  >
                    {ended ? t('standaloneSurvey:seeResults') : t('standaloneSurvey:editAnswerTab')}
                  </NorButton>
                </ListItem>
              )
            })}
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AnsweredSurveys
