import React from 'react'

import { Card, CardContent, Typography, List } from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import FeedbackTargetItem from './FeedbackTargetItem'

const CourseRealisationItem = ({ courseRealisation, className }) => {
  const { i18n } = useTranslation()
  const { feedbackTargets, courseUnitName } = courseRealisation

  const translatedName = getLanguageValue(courseUnitName, i18n.language)

  return (
    <Card className={className}>
      <CardContent>
        <Typography variant="h6" component="h2">
          {translatedName}
        </Typography>
        <List>
          {feedbackTargets.map((feedbackTarget, index) => (
            <FeedbackTargetItem
              feedbackTarget={feedbackTarget}
              divider={index < feedbackTargets.length - 1}
              key={feedbackTarget.id}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

export default CourseRealisationItem
