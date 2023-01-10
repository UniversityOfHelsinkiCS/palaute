import React, { useState } from 'react'
import { Box, Button, CircularProgress, Typography, TextField, Alert } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { writeFileXLSX, utils } from 'xlsx'

import apiClient from '../../util/apiClient'
import { getHeaders, getData } from './utils'

const styles = {
  button: {
    margin: 1,
    width: '170px',
  },
  datePicker: {
    margin: 1,
  },
  link: {
    textDecoration: 'none',
    color: 'white',
  },
}

const ExportCsv = ({ results }) => {
  const headers = getHeaders(results)
  const stats = getData(results)

  const data = [headers, ...stats]

  const worksheet = utils.aoa_to_sheet(data)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'norppa-statistics')

  return (
    <Button
      sx={styles.button}
      variant="contained"
      color="primary"
      disabled={!results.length}
      onClick={() => writeFileXLSX(workbook, 'norppa-statistics.xlsx')}
    >
      Download as CSV
    </Button>
  )
}

const NorppaStatisticView = () => {
  const [opensAt, setOpensAt] = useState(new Date('2021-09-01'))
  const [closesAt, setClosesAt] = useState(new Date())
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [paramsChanged, setParamsChanged] = useState(true)

  const getStatistics = async () => {
    setLoading(true)
    const { data } = await apiClient.get('/admin/norppa-statistics', {
      params: {
        opensAt,
        closesAt,
      },
    })
    setLoading(false)
    setResults(data)
    setParamsChanged(false)
  }

  const handleOpensAtChange = newValue => {
    setParamsChanged(opensAt !== newValue)
    setOpensAt(newValue)
  }
  const handleClosesAtChange = newValue => {
    setParamsChanged(closesAt !== newValue)
    setClosesAt(newValue)
  }

  return (
    <Box marginTop={4}>
      <Typography variant="h6" component="h6">
        Select date range for statistics
      </Typography>
      <Box marginBottom={2}>
        <DatePicker
          label="Opens at"
          inputFormat="dd/MM/yyyy"
          disableFuture
          disableToolbar
          value={opensAt}
          renderInput={props => <TextField margin="normal" {...props} />}
          onChange={handleOpensAtChange}
          sx={styles.datePicker}
        />
        <DatePicker
          label="Closes at"
          inputFormat="dd/MM/yyyy"
          disableToolbar
          value={closesAt}
          renderInput={props => <TextField margin="normal" {...props} />}
          onChange={handleClosesAtChange}
          sx={styles.datePicker}
        />
      </Box>
      <Button variant="contained" color="primary" onClick={getStatistics} sx={styles.button} disabled={!paramsChanged}>
        {!loading && <span>Fetch statistics</span>}
        {loading && (
          <Box display="flex" alignContent="space-between">
            <span>fetching</span> <CircularProgress size={20} />
          </Box>
        )}
      </Button>
      <ExportCsv results={results} />
      {!results.length && !paramsChanged && (
        <Alert marginTop={2} severity="warning">
          No data from the given period
        </Alert>
      )}
    </Box>
  )
}

export default NorppaStatisticView
