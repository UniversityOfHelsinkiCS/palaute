import { Box, Button, Paper, Typography } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import useChangedClosingDates from '../../hooks/useChangedClosingDates'
import apiClient from '../../util/apiClient'
import { getLanguageValue } from '../../util/languageUtils'
import Alert from '../Alert'
import { LoadingProgress } from '../LoadingProgress'

export const ChangedClosingDates = () => {
  const { feedbackTargets, isLoading, refetch } = useChangedClosingDates()
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [sortByUnsolved, setSortByUnsolved] = useState(true)

  if (isLoading || !feedbackTargets) {
    return <LoadingProgress />
  }

  const handleMarkAsSolved = async (id, isSolved) => {
    try {
      await apiClient.put(`/admin/changed-closing-dates/${id}`, { isSolved })
      await refetch()
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const handleRunDateCheckUpdate = async () => {
    try {
      const res = await apiClient.put(`/admin/update-changed-closing-dates`)

      refetch()

      const { updates } = res.data

      enqueueSnackbar(updates ? `${updates} new cases` : `No new cases`, {
        variant: 'info',
      })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const date = (d) => new Date(d).toLocaleDateString()
  const name = (n) => getLanguageValue(n, i18n.language)

  const sortFn = sortByUnsolved
    ? (a, b) => a.is_solved - b.is_solved
    : (a, b) =>
        Date.parse(a.feedback_target.closes_at) -
        Date.parse(b.feedback_target.closes_at)
  const sortedFeedbackTargets = feedbackTargets?.sort(sortFn)

  return (
    <>
      <Box margin={2} marginTop={4}>
        <Alert severity="info">
          Showing feedback targets where the feedback closing date is later than
          16 days or earlier than 6 days after the ending of the course
          realisation, and the teacher has NOT manually edited the dates.
        </Alert>
      </Box>
      <Box margin={2} marginBottom={4}>
        <Alert severity="info">
          Use the UPDATE NOW button to fetch new cases. Old cases where the
          course has ended and the feedback period has ended 16 days ago will be
          removed.
        </Alert>
      </Box>
      <Box margin={2} display="flex">
        <Button
          onClick={handleRunDateCheckUpdate}
          color="primary"
          variant="outlined"
        >
          Update now
        </Button>
        <Box marginRight={4} />
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setSortByUnsolved(!sortByUnsolved)}
        >
          Sort by: {sortByUnsolved ? 'not solved' : 'closing date'}
        </Button>
      </Box>
      <Box>
        {sortedFeedbackTargets?.map(
          ({ feedback_target: fbt, is_solved: isSolved }, i) => (
            <Box key={i} margin={2}>
              <Paper>
                <Box display="flex" alignItems="center">
                  <Box width="20rem" marginLeft={2}>
                    <Link to={`/targets/${fbt.id}`}>
                      {name(fbt.courseRealisation.name)}
                    </Link>
                  </Box>
                  <Box display="flex" padding={2} paddingLeft={2}>
                    <Box marginRight={2}>
                      <Typography variant="body2" color="textSecondary">
                        feedback period:
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        course:
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {date(fbt.opens_at)} – {date(fbt.closes_at)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {date(fbt.courseRealisation.start_date)} –{' '}
                        {date(fbt.courseRealisation.end_date)}
                      </Typography>
                    </Box>
                    <Box marginLeft={8}>
                      <Button
                        color="primary"
                        variant={isSolved ? 'text' : 'contained'}
                        onClick={() => handleMarkAsSolved(fbt.id, !isSolved)}
                      >
                        {!isSolved ? 'Mark as solved' : 'Mark as unsolved'}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>
          ),
        )}
      </Box>
    </>
  )
}
