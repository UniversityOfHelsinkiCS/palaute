import { Box, Paper, Typography } from '@material-ui/core'
import React from 'react'
import { Link } from 'react-router-dom'
import useChangedClosingDates from '../../hooks/useChangedClosingDates'
import Alert from '../Alert'
import { LoadingProgress } from '../LoadingProgress'

export const ChangedClosingDates = ({ language }) => {
  const { feedbackTargets, isLoading } = useChangedClosingDates()

  if (isLoading) {
    return <LoadingProgress />
  }

  const date = (d) => new Date(d).toLocaleDateString()

  return (
    <>
      <Box margin={2} marginBottom={4} marginTop={4}>
        <Alert severity="info">
          Showing not-closed feedback targets where the feedback closing date is
          later than the normal 16 days from the ending of the course
          realisation, and the teacher has NOT manually edited the dates.
        </Alert>
      </Box>
      <Box>
        {feedbackTargets?.map((f) => (
          <Box margin={2}>
            <Paper>
              <Box margin={1}>
                <Link to={`/targets/${f.id}`}>{f.name[language]}</Link>
              </Box>
              <Box display="flex" padding={1} paddingBottom={2} paddingLeft={2}>
                <Box marginRight={2}>
                  <Typography variant="body2" color="textSecondary">
                    feedback target:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    course realisation:
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {date(f.opens_at)} – {date(f.closes_at)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {date(f.start_date)} – {date(f.end_date)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>
    </>
  )
}
