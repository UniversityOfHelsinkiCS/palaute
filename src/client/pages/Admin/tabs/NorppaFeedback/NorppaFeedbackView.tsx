import React, { useState } from 'react'
import { Box, Paper, Typography, IconButton, FormControlLabel, Checkbox, Alert } from '@mui/material'
import { AddAlertOutlined, Undo } from '@mui/icons-material'
import { format } from 'date-fns'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'

import useNorppaFeedbacks from '../../../../hooks/useNorppaFeedbacks'
import apiClient from '../../../../util/apiClient'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { NorButton } from '../../../../components/common/NorButton'

const NorppaFeedbackView = () => {
  const { isLoading, feedbacks, refetch } = useNorppaFeedbacks()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [filterActionRequired, setFilterActionRequired] = useState(false)

  if (isLoading) {
    return <LoadingProgress />
  }

  const sortedFeedbacks =
    feedbacks
      ?.filter(f => !filterActionRequired || !f.solved)
      ?.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)) ?? []

  const handleMarkAsSolved = async (id: number, solved: boolean) => {
    try {
      await apiClient.put(`/norppa-feedback/${id}`, { solved })
      refetch()
    } catch (e) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
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
          label="Show only unsolved"
        />
      </Box>
      {sortedFeedbacks.map(({ id, createdAt, data, responseWanted, solved, user }) => {
        const created = format(new Date(createdAt), 'dd.MM.yyyy')
        return (
          <Box key={id} margin={2}>
            <Paper>
              <Box display="flex">
                <Box display="flex" flexDirection="column" flexGrow={1} padding={2}>
                  <Box marginBottom={2}>
                    <Typography whiteSpace="pre-line" variant="body1">
                      {data}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2">{created}</Typography>
                    <Box marginLeft={4}>
                      <Typography variant="body1">{user?.email ?? 'Anonymous'}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box display="flex" flexDirection="column" padding={2}>
                  {!solved && (
                    <Box width="140px" paddingTop={1}>
                      <NorButton color="primary" onClick={() => handleMarkAsSolved(id, true)}>
                        <Typography variant="button" noWrap>
                          Mark solved
                        </Typography>
                      </NorButton>
                    </Box>
                  )}
                  {solved && responseWanted && (
                    <Box display="flex" width="140px">
                      <Alert>Solved!</Alert>
                      <IconButton size="small" onClick={() => handleMarkAsSolved(id, false)}>
                        <Undo />
                      </IconButton>
                    </Box>
                  )}
                  {!solved && responseWanted && (
                    <Box marginTop={2}>
                      <Alert severity="warning">Response wanted!</Alert>
                    </Box>
                  )}
                  {solved && !responseWanted && (
                    <IconButton color="primary" onClick={() => handleMarkAsSolved(id, false)} size="large">
                      <AddAlertOutlined />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        )
      })}
    </Box>
  )
}

export default NorppaFeedbackView
