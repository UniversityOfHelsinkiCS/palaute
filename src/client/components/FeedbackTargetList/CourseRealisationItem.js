import React from 'react'

import { Card, CardContent, Typography, List } from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import FeedbackTargetItem from './FeedbackTargetItem'
import { formatDate } from './utils'

const CourseRealisationItem = ({
  courseRealisation,
  className,
  studentListVisible,
}) => {
  const { i18n } = useTranslation()
  const { feedbackTargets, name, startDate, endDate } = courseRealisation

  const translatedName = getLanguageValue(name, i18n.language)

  const filteredFeedbackTargets = feedbackTargets.filter(
    ({ feedbackType }) => feedbackType === 'courseRealisation',
  )

  const periodInfo = `${formatDate(startDate)} - ${formatDate(endDate)}`

  return (
    <Card className={className}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {translatedName}
        </Typography>

        <Typography color="textSecondary" component="span">
          {periodInfo}
        </Typography>

        <List>
          {filteredFeedbackTargets.map((feedbackTarget, index) => (
            <FeedbackTargetItem
              feedbackTarget={feedbackTarget}
              divider={index < filteredFeedbackTargets.length - 1}
              key={feedbackTarget.id}
              studentListVisible={studentListVisible}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

export default CourseRealisationItem
