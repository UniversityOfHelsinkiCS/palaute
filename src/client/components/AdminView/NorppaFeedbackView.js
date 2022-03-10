import React from 'react'
import {
  Box,
  Button,
  CircularProgress,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core'
import { format } from 'date-fns'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'

import useNorppaFeedbacks from '../../hooks/useNorppaFeedbacks'
import apiClient from '../../util/apiClient'

const useStyles = makeStyles(() => ({
  container: {
    marginTop: 10,
  },
  feedback: {
    marginBottom: 5,
    padding: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  response: {
    background: '#dde6ff',
  },
  text: {
    marginBottom: 5,
  },
}))

const NorppaFeedbackView = () => {
  const { isLoading, feedbacks, refetch } = useNorppaFeedbacks()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  if (isLoading) {
    return <CircularProgress />
  }

  const sortedFeedbacks = feedbacks.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )

  const handleClick = async (id) => {
    try {
      await apiClient.put(`/norppa-feedback/${id}`)
      refetch()
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <Box className={classes.container}>
      {sortedFeedbacks.map(({ id, createdAt, data, responseWanted, user }) => {
        const created = format(new Date(createdAt), 'dd.MM.yyyy')
        return (
          <Paper
            className={`${classes.feedback} ${
              responseWanted ? classes.response : ''
            }`}
            key={id}
          >
            <Box>
              <Typography
                variant="body1"
                component="p"
                className={classes.text}
              >
                {data}
              </Typography>
              <Typography
                variant="body2"
                component="p"
                className={classes.info}
              >
                {user.email} {created}
              </Typography>
            </Box>
            <Box>
              {responseWanted && (
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => handleClick(id)}
                >
                  Mark as solved
                </Button>
              )}
            </Box>
          </Paper>
        )
      })}
    </Box>
  )
}

export default NorppaFeedbackView
