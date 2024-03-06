import React from 'react'
import { Box, LinearProgress } from '@mui/material'
import { useParams } from 'react-router'
import { useCourseUnitGroupSummaries } from './api'
import SummaryScrollContainer from './components/SummaryScrollContainer'
import { SorterRow } from './components/SorterRow'
import { useSummaryContext } from './context'
import CourseUnitGroupSummaryRow from './components/CourseUnitGroupRow'

const ForCourseUnitGroup = () => {
  const { code } = useParams()
  const { questions } = useSummaryContext()
  const { courseUnitGroup, isLoading } = useCourseUnitGroupSummaries({ courseCode: code })

  return (
    <SummaryScrollContainer>
      <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
        <SorterRow />
        {isLoading ? (
          <LinearProgress />
        ) : (
          <CourseUnitGroupSummaryRow courseUnitGroup={courseUnitGroup} questions={questions} />
        )}
      </Box>
    </SummaryScrollContainer>
  )
}

export default ForCourseUnitGroup
