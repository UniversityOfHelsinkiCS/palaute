import React, { Fragment } from 'react'

import {
  Card,
  CardContent,
  Typography,
  List,
  Divider,
  makeStyles,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import FeedbackTargetItem from './FeedbackTargetItem'

const CourseRealisationItem = ({ courseRealisation, className }) => {
  const { i18n } = useTranslation()
  const { feedbackTargets, name } = courseRealisation

  const translatedName = getLanguageValue(name, i18n.language)

  return (
    <Card className={className}>
      <CardContent>
        <Typography variant="h6" component="h2">
          {translatedName}
        </Typography>
        <List>
          {feedbackTargets.map((feedbackTarget, index) => (
            <Fragment key={feedbackTarget.id}>
              <FeedbackTargetItem feedbackTarget={feedbackTarget} />
              {index < feedbackTargets.length - 1 && <Divider component="li" />}
            </Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

export default CourseRealisationItem
