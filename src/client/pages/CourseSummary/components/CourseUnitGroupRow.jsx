import React from 'react'
import { blueGrey } from '@mui/material/colors'
import { useTranslation } from 'react-i18next'
import { Box } from '@mui/material'
import { getLanguageValue } from '../../../util/languageUtils'
import { CourseUnitLabel } from './Labels'
import RowHeader from './RowHeader'
import { FeedbackTargetSummaryRow, SummaryResultElements } from './SummaryRow'

const CourseUnitGroupSummaryRow = ({ courseUnitGroup, questions }) => {
  const { i18n } = useTranslation()

  const label = (
    <CourseUnitLabel name={getLanguageValue(courseUnitGroup.name, i18n.language)} code={courseUnitGroup.courseCode} />
  )

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      gap="0.4rem"
      pt="0.5rem"
      sx={{ transition: 'padding-top 0.2s ease-out' }}
    >
      <Box display="flex" alignItems="stretch" gap="0.2rem">
        <RowHeader label={label} />
        <SummaryResultElements summary={courseUnitGroup.summary} questions={questions} />
      </Box>
      <Box
        sx={{ pl: '2rem', borderLeft: `solid 3px ${blueGrey[100]}`, pb: '0.5rem' }}
        display="flex"
        flexDirection="column"
        alignItems="stretch"
        gap="0.4rem"
      >
        {courseUnitGroup.feedbackTargets.map(fbt => (
          <FeedbackTargetSummaryRow key={fbt.id} feedbackTarget={fbt} questions={questions} />
        ))}
      </Box>
    </Box>
  )
}

export default CourseUnitGroupSummaryRow
