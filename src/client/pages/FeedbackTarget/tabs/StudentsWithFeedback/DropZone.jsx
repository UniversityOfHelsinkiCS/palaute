import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import { writeFileXLSX, utils } from 'xlsx'

import { Box } from '@mui/material'
import { NorButton } from '../../../../components/common/NorButton'

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
  const [filename, setFilename] = useState('')

  const { t } = useTranslation()

  const onDrop = acceptedFiles => {
    const reader = new FileReader()

    reader.onabort = () => alert('file reading was aborted')
    reader.onerror = () => alert('file reading has failed')
    reader.onload = () => {
      // Remove .csv ending, shorten to fit into 32 character limit
      const filename = `${acceptedFiles[0].name.slice(0, -4).slice(0, 17)}_feedback.xlsx`

      const re = /[;\t]/gm
      const re2 = /["\r]/gm
      const fileString = reader.result
      let rows = fileString.trim().split('\n')
      rows = rows.map(row => row.replaceAll(re2, '').split(re))

      setData(rows)
      setFilename(filename)
    }
    acceptedFiles.forEach(file => reader.readAsText(file))
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject, isDragAccept } = useDropzone({
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
    [isDragActive, isDragReject]
  )

  return (
    <Box style={{ display: 'flex', flexDirection: 'row-reverse' }}>
      <Box>
        <div className="container" style={{ cursor: 'pointer' }}>
          <div data-cy="dropzone" {...getRootProps({ style })}>
            <input {...getInputProps()} />
            <p>{t('common:dropZoneInfo1')}</p>
            <p>{t('common:dropZoneInfo2')}</p>
          </div>
        </div>
        <ExportXLSX headers={data[0]} rows={data.slice(1)} students={students} filename={filename} />
      </Box>
    </Box>
  )
}

const ExportXLSX = ({ headers, rows, students, filename }) => {
  const { t } = useTranslation()

  const isStudentNumber = value => {
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
    const student = students.find(student => Number(student.studentNumber) === Number(row[index]))
    const newRow = [...row, student ? student.feedbackGiven : '']
    updatedRows.push(newRow)
  }

  const studentNumbers = updatedRows.map(row => Number(row[index]))
  const missingStudents = students.filter(student => !studentNumbers.includes(Number(student.studentNumber)))

  for (const student of missingStudents) {
    const [firstName, lastName, studentNumber, email, feedbackGiven] = [...Object.values(student)]
    const newRow = [lastName, firstName, studentNumber, email, ...new Array(headers.length - 4).fill(''), feedbackGiven]
    updatedRows.push(newRow)
  }

  const data = [headers.concat(t('common:feedbackHeader')), ...updatedRows]

  const worksheet = utils.aoa_to_sheet(data)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, filename)

  return (
    <Box style={{ display: 'flex', flexDirection: 'row-reverse' }}>
      <NorButton
        color="secondary"
        style={{ margin: 10, width: '170px' }}
        onClick={() => writeFileXLSX(workbook, filename)}
      >
        {t('common:exportXLSX')}
      </NorButton>
    </Box>
  )
}

export default DropZone
