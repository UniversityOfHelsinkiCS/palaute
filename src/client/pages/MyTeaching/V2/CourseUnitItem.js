import React from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Typography } from '@mui/material'

import FeedbackTargetList from './FeedbackTargetList/FeedbackTargetList'
import FeedbackTargetListItem from './FeedbackTargetList/FeedbackTargetListItem'

import InterimFeedbackChip from './chips/InterimFeedbackChip'

import { getLanguageValue } from '../../../util/languageUtils'
import { getCourseCode } from '../../../util/courseIdentifiers'

const styles = {
  item: {
    backgroundColor: 'white',
    mt: 2,
    '&:before': {
      display: 'none',
    },
    minHeight: '100px',
  },
  details: {
    display: 'block',
    padding: 0,
  },
}

const CourseUnitItem = ({ courseUnit, group }) => {
  const { t, i18n } = useTranslation()

  const { name, courseRealisations } = courseUnit
  const courseRealisation = courseRealisations[0]
  const { feedbackTargets, interimFeedbackTargets } = courseRealisation

  const visibleCourseCode = getCourseCode(courseUnit)
  const courseName = getLanguageValue(name, i18n.language)

  return (
    <Box sx={styles.item} data-cy="my-teaching-course-unit-item">
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography component="h3" variant="body1">
          {visibleCourseCode} {courseName}
        </Typography>

        {/* {interimFeedbackTargets.length > 0 && <InterimFeedbackChip parentFeedbackTarget={feedbackTarget} />} */}
      </Box>

      <Box sx={styles.details}>
        <FeedbackTargetList>
          {feedbackTargets?.length === 0 ? (
            <Box p={2}>
              <Typography color="textSecondary" align="center">
                {t('teacherView:noCourseRealisations')}
              </Typography>
            </Box>
          ) : (
            feedbackTargets.map((target, i) => {
              const feedbackTarget = {
                ...target,
                courseRealisation,
              }

              return (
                <FeedbackTargetListItem
                  key={feedbackTarget.id}
                  feedbackTarget={feedbackTarget}
                  divider={i < feedbackTargets.length - 1}
                />
              )
            })
          )}
        </FeedbackTargetList>
      </Box>
    </Box>
  )
}

export default CourseUnitItem