import React, { useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  makeStyles,
  Typography,
} from '@material-ui/core'
import { KeyboardDatePicker } from '@material-ui/pickers'
import { Alert } from '@material-ui/lab'
import { CSVLink } from 'react-csv'
import Papa from 'papaparse'

import apiClient from '../../util/apiClient'
import { getHeaders, getData } from './utils'

const useStyles = makeStyles(() => ({
  button: {
    margin: 5,
    width: '170px',
  },
  datePicker: {
    margin: 5,
  },
  link: {
    textDecoration: 'none',
    color: 'white',
  },
}))

const ExportCsv = ({ results }) => {
  const headers = getHeaders(results)
  const stats = getData(results)

  const data = [headers, ...stats]
  const classes = useStyles()

  const parsedData = Papa.unparse(data, { delimiter: ';' })

  return (
    <CSVLink
      className={classes.link}
      data={parsedData}
      filename="norppa-statistics.csv"
    >
      Export as csv
    </CSVLink>
  )
}

const NorppaStatisticView = () => {
  const [opensAt, setOpensAt] = useState(new Date('2021-09-01'))
  const [closesAt, setClosesAt] = useState(new Date())
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [paramsChanged, setParamsChanged] = useState(true)

  const classes = useStyles()

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

  const handleOpensAtChange = (newValue) => {
    setParamsChanged(opensAt !== newValue)
    setOpensAt(newValue)
  }
  const handleClosesAtChange = (newValue) => {
    setParamsChanged(closesAt !== newValue)
    setClosesAt(newValue)
  }

  return (
    <Box marginTop={4}>
      <Typography variant="h6" component="h6">
        Select date range for statistics
      </Typography>
      <Box marginBottom={2}>
        <KeyboardDatePicker
          label="Opens at"
          format="dd.MM.yyyy"
          disableFuture
          disableToolbar
          variant="inline"
          value={opensAt}
          onChange={handleOpensAtChange}
          className={classes.datePicker}
        />
        <KeyboardDatePicker
          label="Closes at"
          format="dd.MM.yyyy"
          disableToolbar
          variant="inline"
          value={closesAt}
          onChange={handleClosesAtChange}
          className={classes.datePicker}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={getStatistics}
        className={classes.button}
        disabled={!paramsChanged}
      >
        {!loading && <span>Fetch statistics</span>}
        {loading && (
          <Box display="flex" alignContent="space-between">
            <span>fetching</span> <CircularProgress size={20} />
          </Box>
        )}
      </Button>
      <Button
        variant="contained"
        color="primary"
        disabled={!results.length}
        className={classes.button}
      >
        {results.length ? <ExportCsv results={results} /> : 'Export as CSV'}
      </Button>
      {!results.length && !paramsChanged && (
        <Alert marginTop={2} severity="warning">
          No data from the given period
        </Alert>
      )}
    </Box>
  )
}

export default NorppaStatisticView
