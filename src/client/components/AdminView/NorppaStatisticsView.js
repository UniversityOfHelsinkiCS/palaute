import React, { useState } from 'react'
import {
  Box,
  Button,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core'
import { DatePicker } from '@material-ui/pickers'
import { CSVLink } from 'react-csv'
import Papa from 'papaparse'

import apiClient from '../../util/apiClient'
import { getHeaders, getData } from './utils'

const useStyles = makeStyles(() => ({
  button: {
    margin: 5,
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
      filename="norppaStatistics"
    >
      Export as csv
    </CSVLink>
  )
}

const NorppaStatisticView = () => {
  const [opensAt, setOpensAt] = useState(new Date())
  const [closesAt, setClosesAt] = useState(new Date())
  const [results, setResults] = useState([])

  const classes = useStyles()

  const getStatistics = async () => {
    const { data } = await apiClient.get('/admin/norppa-statistics', {
      params: {
        opensAt,
        closesAt,
      },
    })

    setResults(data)
  }

  const handleOpensAtChange = (newValue) => {
    setOpensAt(newValue)
  }
  const handleClosesAtChange = (newValue) => {
    setClosesAt(newValue)
  }

  return (
    <Box>
      <Typography variant="h6" component="h6">
        Select date range for statistics
      </Typography>
      <Box>
        <DatePicker
          label="Opens at"
          format="dd.MM.yyyy"
          disableFuture
          value={opensAt}
          onChange={handleOpensAtChange}
          className={classes.datePicker}
        />
        <DatePicker
          label="Closes at"
          format="dd.MM.yyyy"
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
      >
        Fetch statistics
      </Button>
      <Button
        variant="contained"
        color="primary"
        disabled={!results.length}
        className={classes.button}
      >
        {results.length ? <ExportCsv results={results} /> : 'Export as CSV'}
      </Button>
    </Box>
  )
}

export default NorppaStatisticView
