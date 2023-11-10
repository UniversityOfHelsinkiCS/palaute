import React from 'react'

import { Card, CardContent, Typography, List } from '@mui/material'

import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import { getCourseName } from './utils'
import FeedbackTargetItem from './FeedbackTargetItem'

const CourseRealisationItem = ({ courseRealisation }) => {
  const { i18n } = useTranslation()
  const { feedbackTargets } = courseRealisation

  const courseName = getCourseName(courseRealisation)
  const translatedName = getLanguageValue(courseName, i18n.language)

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="body1" fontWeight={600} component="h2">
          {translatedName}
        </Typography>
        <List disablePadding>
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
