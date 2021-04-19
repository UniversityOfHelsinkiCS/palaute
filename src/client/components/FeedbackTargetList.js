import React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, Typography } from '@material-ui/core'

import { getLanguageValue } from '../util/languageUtils'

import useFeedbackTargets from '../hooks/useFeedbackTargets'

const FeedbackTargetList = () => {
  const courseId = useParams().id

  const { i18n } = useTranslation()

  const data = useFeedbackTargets(courseId)

  const feedbackTargets = !data.isLoading && data.feedbackTargets

  return (
    <div>
      <Typography variant="h6" component="h3">
        Course unit feedback targets
      </Typography>
      {feedbackTargets &&
        feedbackTargets.map((feedbackTarget) => (
          <Card key={feedbackTarget.id} variant="outlined">
            <CardContent>
              <Typography variant="h7" component="h4">
                {getLanguageValue(
                  feedbackTarget.courseUnit.name,
                  i18n.language,
                )}
              </Typography>
              <Typography variant="p" component="p">
                {getLanguageValue(feedbackTarget.name, i18n.language)}
              </Typography>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}

export default FeedbackTargetList
