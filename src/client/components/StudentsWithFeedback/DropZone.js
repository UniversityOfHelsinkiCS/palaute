/* eslint-disable no-alert */
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import { CSVLink } from 'react-csv'
import Papa from 'papaparse'

import { Box, Button, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(() => ({
  box: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  button: {
    margin: 10,
    width: '170px',
  },
  link: {
    opacity: 0,
    position: 'absolute',
  },
}))

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  verticalAlign: 'center',
  padding: '20px',
  marginRight: 10,
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
}

const activeStyle = {
  borderColor: '#2196f3',
}

const acceptStyle = {
  borderColor: '#00e676',
}

const rejectStyle = {
  borderColor: '#ff1744',
}

const DropZone = ({ students }) => {
  const [data, setData] = useState([])

  const classes = useStyles()
  const { t } = useTranslation()

  const onDrop = (acceptedFiles) => {
    const reader = new FileReader()

    reader.onabort = () => alert('file reading was aborted')
    reader.onerror = () => alert('file reading has failed')
    reader.onload = () => {
      const re = /[;\t]/gm
      const re2 = /["\r]/gm
      const fileString = reader.result
      let rows = fileString.trim().split('\n')
      rows = rows.map((row) => row.replaceAll(re2, '').split(re))
      setData(rows)
    }
    acceptedFiles.forEach((file) => reader.readAsText(file))
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isDragAccept,
  } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 5000000,
    accept: '.csv',
  })

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject],
  )

  return (
    <Box className={classes.box}>
      <Box>
        <div className="container" style={{ cursor: 'pointer' }}>
          <div data-cy="dropzone" {...getRootProps({ style })}>
            <input {...getInputProps()} />
            <p>{t('dropZoneInfo1')}</p>
            <p>{t('dropZoneInfo2')}</p>
          </div>
        </div>
        <ExportCsv headers={data[0]} rows={data.slice(1)} students={students} />
      </Box>
    </Box>
  )
}

const ExportCsv = ({ headers, rows, students }) => {
  const classes = useStyles()
  const { t } = useTranslation()

  const isStudentNumber = (value) => {
    value = Number(value)
    if (Number.isNaN(value)) return false
    if (String(value).length !== 8) return false
    return true
  }

  if (rows.length === 0) return null

  const index = rows[0].findIndex(isStudentNumber)

  if (index === -1) return null

  const updatedRows = []
  for (const row of rows) {
    const student = students.find(
      (student) => Number(student.studentNumber) === Number(row[index]),
    )
    const newRow = [...row, student ? student.feedbackGiven : '']
    updatedRows.push(newRow)
  }

  const data = [headers.concat(t('feedbackHeader')), ...updatedRows]
  const parsedData = Papa.unparse(data, { delimiter: ';' })

  return (
    <Box className={classes.box}>
      <Button variant="outlined" color="primary" className={classes.button}>
        {t('downloadCSV')}
        <CSVLink
          className={classes.link}
          data={parsedData}
          filename="testing.csv"
        >
          {t('downloadCSV')}
        </CSVLink>
      </Button>
    </Box>
  )
}

export default DropZone
