import React, { useState } from 'react'
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core'
import { Undo } from '@material-ui/icons'
import { format } from 'date-fns'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'

import useNorppaFeedbacks from '../../hooks/useNorppaFeedbacks'
import apiClient from '../../util/apiClient'
import { LoadingProgress } from '../LoadingProgress'
import Alert from '../Alert'

const NorppaFeedbackView = () => {
  const { isLoading, feedbacks, refetch } = useNorppaFeedbacks()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [filterActionRequired, setFilterActionRequired] = useState(false)

  if (isLoading) {
    return <LoadingProgress />
  }

  const sortedFeedbacks = feedbacks
    .filter((f) => !filterActionRequired || (!f.solved && f.responseWanted))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const handleMarkAsSolved = async (id, solved) => {
    try {
      await apiClient.put(`/norppa-feedback/${id}`, { solved })
      refetch()
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <Box marginTop={8}>
      <Box margin={2} paddingLeft={2} display="flex">
        <FormControlLabel
          control={
            <Checkbox
              checked={filterActionRequired}
              onChange={() => setFilterActionRequired(!filterActionRequired)}
              color="primary"
            />
          }
          label="Waiting response"
        />
      </Box>
      {sortedFeedbacks.map(
        ({ id, createdAt, data, responseWanted, solved, user }) => {
          const created = format(new Date(createdAt), 'dd.MM.yyyy')
          return (
            <Box key={id} margin={2}>
              <Paper>
                <Box display="flex">
                  <Box
                    display="flex"
                    flexDirection="column"
                    flexGrow={1}
                    padding={2}
                  >
                    <Box marginBottom={2}>
                      <Typography variant="body1">{data}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2">{created}</Typography>
                      <Box marginLeft={4}>
                        <Typography variant="body1">{user.email}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box display="flex" flexDirection="column" padding={2}>
                    {!solved && responseWanted && (
                      <Box width="140px" paddingTop={1}>
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={() => handleMarkAsSolved(id, true)}
                        >
                          <Typography variant="button" noWrap>
                            Mark solved
                          </Typography>
                        </Button>
                      </Box>
                    )}
                    {solved && responseWanted && (
                      <Box display="flex" width="140px">
                        <Alert>Solved!</Alert>
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsSolved(id, false)}
                        >
                          <Undo />
                        </IconButton>
                      </Box>
                    )}
                    {!solved && responseWanted && (
                      <Box marginTop={2}>
                        <Alert severity="warning">Response wanted!</Alert>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Box>
          )
        },
      )}
    </Box>
  )
}

export default NorppaFeedbackView
