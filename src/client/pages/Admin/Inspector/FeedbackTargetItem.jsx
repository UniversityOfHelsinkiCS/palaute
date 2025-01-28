import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Link } from 'react-router-dom'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
  Link as MuiLink,
  AccordionActions,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material'

import { useSnackbar } from 'notistack'

import apiClient from '../../../util/apiClient'
import { getLanguageValue } from '../../../util/languageUtils'
import { getCourseCode, getPrimaryCourseName } from '../../../util/courseIdentifiers'
import { NorButton } from '../../../components/common/NorButton'

const Details = ({ feedbackTarget: fbt }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>course code</TableCell>
          <TableCell>CUR start date</TableCell>
          <TableCell>CUR end date</TableCell>
          <TableCell>feedback opens</TableCell>
          <TableCell>feedback closes</TableCell>
          <TableCell>student count</TableCell>
          <TableCell>feedback count</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>{fbt.id}</TableCell>
          <TableCell>{fbt.courseUnit.courseCode}</TableCell>
          <TableCell>{fbt.courseRealisation.startDate.toLocaleDateString()}</TableCell>
          <TableCell>{fbt.courseRealisation.endDate.toLocaleDateString()}</TableCell>
          <TableCell>{fbt.opensAt.toLocaleDateString()}</TableCell>
          <TableCell>{fbt.closesAt.toLocaleDateString()}</TableCell>
          <TableCell>{fbt.summary?.data?.studentCount ?? '-'}</TableCell>
          <TableCell>{fbt.summary?.data?.feedbackCount ?? '-'}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <Box m={4} />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name of</TableCell>
          <TableCell>FI</TableCell>
          <TableCell>EN</TableCell>
          <TableCell>SV</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>CU</TableCell>
          <TableCell>{fbt.courseUnit.name.fi}</TableCell>
          <TableCell>{fbt.courseUnit.name.en}</TableCell>
          <TableCell>{fbt.courseUnit.name.sv}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>CUR</TableCell>
          <TableCell>{fbt.courseRealisation.name.fi}</TableCell>
          <TableCell>{fbt.courseRealisation.name.en}</TableCell>
          <TableCell>{fbt.courseRealisation.name.sv}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Feedback target</TableCell>
          <TableCell>{fbt.name.fi}</TableCell>
          <TableCell>{fbt.name.en}</TableCell>
          <TableCell>{fbt.name.sv}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <Box m={4} />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>openingEmail</TableCell>
          <TableCell>responseEmail</TableCell>
          <TableCell>responseReminderEmail</TableCell>
          <TableCell>reminderLastSentAt</TableCell>
          <TableCell>continuousFeedback</TableCell>
          <TableCell>digestEmail</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>{String(fbt.feedbackOpeningReminderEmailSent)}</TableCell>
          <TableCell>{String(fbt.feedbackResponseEmailSent)}</TableCell>
          <TableCell>{String(fbt.feedbackResponseReminderEmailSent)}</TableCell>
          <TableCell>{String(fbt.feedbackReminderLastSentAt)}</TableCell>
          <TableCell>{String(fbt.continuousFeedbackEnabled)}</TableCell>
          <TableCell>{String(fbt.sendContinuousFeedbackDigestEmail)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <Box m={4} />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Organisation responsible for</TableCell>
          <TableCell>ID</TableCell>
          <TableCell>code</TableCell>
          <TableCell>name</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {fbt.courseUnit.organisations.map(org => (
          <TableRow key={org.id}>
            <TableCell>CU</TableCell>
            <TableCell>{org.id}</TableCell>
            <TableCell>{org.code}</TableCell>
            <TableCell>{org.name?.fi}</TableCell>
          </TableRow>
        ))}
        {fbt.courseRealisation.organisations.map(org => (
          <TableRow key={org.id}>
            <TableCell>CUR</TableCell>
            <TableCell>{org.id}</TableCell>
            <TableCell>{org.code}</TableCell>
            <TableCell>{org.name?.fi}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

const Actions = ({ feedbackTarget }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [updaterRunning, setUpdaterRunning] = useState(false)

  const resendFeedbackResponseEmail = async () => {
    if (!window.confirm(`Resend counter feedback email to students of ${feedbackTarget.courseUnit.name?.fi}?`)) return
    const body = { id: feedbackTarget.id }
    try {
      const res = await apiClient.put(`/admin/resend-response`, body)
      enqueueSnackbar(`Success, counter feedback emailed to ${res.data.count} students!`)
    } catch (error) {
      enqueueSnackbar(`Error: ${error.message}`)
    }
  }

  const handleRunUpdater = feedbackTarget => async () => {
    if (!window.confirm(`Update enrollments of ${feedbackTarget.courseUnit.name?.fi}?`)) return
    try {
      const req = apiClient.post(`/admin/run-updater/enrolments/${feedbackTarget?.courseRealisationId}`)
      setUpdaterRunning(true)
      await req
      enqueueSnackbar('Enrolments updated', { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(`Error: ${error.response?.status}`, { variant: 'error' })
    }
    setUpdaterRunning(false)
  }

  return (
    <>
      <MuiLink to={`/targets/${feedbackTarget.id}`} component={Link} underline="hover">
        Go to feedback view
      </MuiLink>
      {feedbackTarget.feedbackResponseEmailSent && (
        <NorButton onClick={resendFeedbackResponseEmail}>Resend counter feedback</NorButton>
      )}
      <NorButton onClick={handleRunUpdater(feedbackTarget)} style={{ width: '300px' }}>
        {!updaterRunning ? 'Run updater for enrollments' : 'Working on it...'}
      </NorButton>
    </>
  )
}

const FeedbackTargetItem = ({ feedbackTarget }) => {
  const { i18n } = useTranslation()

  if (!feedbackTarget) return null

  const { id, courseUnit, courseRealisation, opensAt, closesAt } = feedbackTarget

  const primaryCourseName = getLanguageValue(
    getPrimaryCourseName(courseUnit, courseRealisation, feedbackTarget),
    i18n.language
  )
  const courseCode = getCourseCode(courseUnit)

  return (
    <Accordion>
      <AccordionSummary>
        <Box display="flex" width="100%">
          <Typography style={{ flexShrink: 0, flexBasis: '15%' }}>{id}</Typography>
          <Box m={2} />
          <Typography style={{ flexShrink: 0, flexBasis: '16%' }}>{courseCode}</Typography>
          <Box m={2} />
          <Typography style={{ flexShrink: 0, flexBasis: '30%' }}>{primaryCourseName}</Typography>
          <Box m={2} />
          <Typography variant="body2">
            {opensAt.toLocaleDateString()} - {closesAt.toLocaleDateString()}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails style={{ backgroundColor: 'ghostwhite' }}>
        <Details feedbackTarget={feedbackTarget} />
      </AccordionDetails>
      <AccordionActions>
        <Actions feedbackTarget={feedbackTarget} />
      </AccordionActions>
    </Accordion>
  )
}

export default FeedbackTargetItem
