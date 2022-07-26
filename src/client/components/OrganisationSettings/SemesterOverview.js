import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Typography,
} from '@mui/material'
import React from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'
import apiClient from '../../util/apiClient'
import { LoadingProgress } from '../LoadingProgress'
import { getLanguageValue } from '../../util/languageUtils'

const useOrganisationFeedbackTargets = ({ code }) => {
  const queryKey = ['organisationFeedbackTargets', code]

  const queryFn = async () => {
    const { data: feedbackTargets } = await apiClient.get(
      `/feedback-targets/for-organisation/${code}`,
    )

    const sortedAndGroupedFeedbackTargets = _.sortBy(
      Object.entries(
        _.groupBy(feedbackTargets, (fbt) => fbt.courseRealisation.startDate),
      ).map(([startDate, feedbackTargets]) => [
        new Date(startDate),
        feedbackTargets,
      ]),
      ([startDate, feedbackTargets]) => startDate,
    )

    return sortedAndGroupedFeedbackTargets
  }

  const { data: feedbackTargets, ...rest } = useQuery(queryKey, queryFn)

  return { feedbackTargets, ...rest }
}

const styles = {
  horizontalScrollContainer: {
    overflowX: 'scroll',
  },
}

const SemesterOverview = () => {
  const { code } = useParams()
  const { t, i18n } = useTranslation()
  const { feedbackTargets, isLoading } = useOrganisationFeedbackTargets({
    code,
  })

  if (isLoading) return <LoadingProgress />
  return (
    <Box display="flex" sx={styles.horizontalScrollContainer}>
      {feedbackTargets.map(([startDate, feedbackTargets]) => (
        <Box key={startDate} m={1} minWidth="20rem">
          <Box m={2}>{new Date(startDate).toLocaleDateString()}</Box>
          {feedbackTargets.map((fbt) => (
            <Box key={fbt.id} m={1}>
              <Accordion
                TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
              >
                <AccordionSummary>
                  <Typography fontSize="14px">
                    {getLanguageValue(fbt.courseUnit.name, i18n.language)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography fontSize="12px">
                    {getLanguageValue(
                      fbt.courseRealisation.name,
                      i18n.language,
                    )}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default SemesterOverview
