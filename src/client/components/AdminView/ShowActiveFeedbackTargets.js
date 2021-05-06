import React from 'react'

import { Link } from 'react-router-dom'

import { lightFormat } from 'date-fns'

import { CircularProgress, makeStyles } from '@material-ui/core'

import useActiveFeedbackTargets from '../../hooks/useActiveFeedbackTargets'

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(2),
  },
  progressContainer: {
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
  languageTabs: {
    marginBottom: theme.spacing(2),
  },
}))

const formatDate = (date) => lightFormat(new Date(date), 'd.M.yyyy')

const ShowActiveFeedbackTargets = () => {
  const classes = useStyles()

  const { feedbackTargets, isLoading } = useActiveFeedbackTargets()

  if (isLoading) {
    return (
      <div className={classes.progressContainer}>
        <CircularProgress />
      </div>
    )
  }

  feedbackTargets.sort((a, b) =>
    a.courseUnit.courseCode < b.courseUnit.courseCode ? -1 : 1,
  )

  return (
    <>
      <h2>Feedbacks that are configured</h2>
      {feedbackTargets.map((target) => (
        <div key={target.id}>
          <b>{target.courseUnit.courseCode}</b>
          {'\t'}
          <Link to={`/targets/${target.id}/results`}>
            {target.courseRealisation.name.fi}
          </Link>
          , {formatDate(target.opensAt)} - {formatDate(target.closesAt)}
        </div>
      ))}
    </>
  )
}

export default ShowActiveFeedbackTargets
