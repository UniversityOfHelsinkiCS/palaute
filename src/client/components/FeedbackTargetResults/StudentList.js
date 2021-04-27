import React from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  makeStyles,
  TableContainer,
} from '@material-ui/core'

import Alert from '../Alert'
import useStudentsWithFeedback from '../../hooks/useStudentsWithFeedback'

const useStudentTableStyles = makeStyles({
  container: {
    maxHeight: '500px',
  },
})

const StudentTable = ({ students }) => {
  const classes = useStudentTableStyles()
  const { t } = useTranslation()

  return (
    <TableContainer className={classes.container}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>{t('firstName')}</TableCell>
            <TableCell>{t('lastName')}</TableCell>
            <TableCell>{t('username')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map(({ id, firstName, lastName, username }) => (
            <TableRow key={id}>
              <TableCell>{firstName}</TableCell>
              <TableCell>{lastName}</TableCell>
              <TableCell>{username}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const FeedbackTargetResults = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const { students, isLoading } = useStudentsWithFeedback(id)

  const hasStudents = !isLoading && Boolean(students?.length > 0)

  return (
    <Card>
      <CardContent>
        <Box mb={2}>
          <Typography variant="h6" component="h2">
            {t('feedbackTargetResults:studentsWithFeedbackHeading')}
          </Typography>
        </Box>

        <Box mb={2}>
          <Alert severity="info">
            {t('feedbackTargetResults:notVisibleToStudentsInfo')}
          </Alert>
        </Box>

        {hasStudents && <StudentTable students={students} />}

        {!hasStudents && (
          <Typography>
            {t('feedbackTargetResults:noStudentsWithFeedback')}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default FeedbackTargetResults
