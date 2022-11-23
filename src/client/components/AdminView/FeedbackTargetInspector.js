import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  TextField,
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
import { debounce } from 'lodash'
import { useSnackbar } from 'notistack'

import apiClient from '../../util/apiClient'
import useHistoryState from '../../hooks/useHistoryState'

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
          <TableCell>
            {fbt.courseRealisation.startDate.toLocaleDateString()}
          </TableCell>
          <TableCell>
            {fbt.courseRealisation.endDate.toLocaleDateString()}
          </TableCell>
          <TableCell>{fbt.opensAt.toLocaleDateString()}</TableCell>
          <TableCell>{fbt.closesAt.toLocaleDateString()}</TableCell>
          <TableCell>{fbt.studentCount}</TableCell>
          <TableCell>{fbt.feedbackCount}</TableCell>
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
        {fbt.courseUnit.organisations.map((org) => (
          <TableRow key={org.id}>
            <TableCell>CU</TableCell>
            <TableCell>{org.id}</TableCell>
            <TableCell>{org.code}</TableCell>
            <TableCell>{org.name?.fi}</TableCell>
          </TableRow>
        ))}
        {fbt.courseRealisation.organisations.map((org) => (
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
    if (
      // eslint-disable-next-line no-alert
      !window.confirm(
        `Resend counter feedback email to students of ${feedbackTarget.courseUnit.name?.fi}?`,
      )
    )
      return
    const body = { id: feedbackTarget.id }
    try {
      const res = await apiClient.put(`/admin/resend-response`, body)
      enqueueSnackbar(
        `Success, counter feedback emailed to ${res.data.count} students!`,
      )
    } catch (error) {
      enqueueSnackbar(`Error: ${error.message}`)
    }
  }

  const handleRunUpdater = (feedbackTarget) => async () => {
    if (
      // eslint-disable-next-line no-alert
      !window.confirm(
        `Update enrollments of ${feedbackTarget.courseUnit.name?.fi}?`,
      )
    )
      return
    try {
      const req = apiClient.post(
        `/admin/run-updater/enrolments/${feedbackTarget?.courseRealisationId}`,
      )
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
      <MuiLink
        to={`/targets/${feedbackTarget.id}`}
        component={Link}
        underline="hover"
      >
        Go to feedback view
      </MuiLink>
      {feedbackTarget.feedbackResponseEmailSent && (
        <Button onClick={resendFeedbackResponseEmail}>
          Resend counter feedback
        </Button>
      )}
      <Button
        onClick={handleRunUpdater(feedbackTarget)}
        style={{ width: '300px' }}
      >
        {!updaterRunning ? 'Run updater for enrollments' : 'Working on it...'}
      </Button>
    </>
  )
}

const FeedbackTargetInspector = () => {
  const [potentialFeedbackTargets, setPotentialFeedbackTargets] =
    useHistoryState('potentialFeedbacktargets', [])
  const [count, setCount] = useHistoryState('potentialFeedbackTargetCount', 0)

  const [query, setQuery] = useHistoryState('feedback-target_query', {
    id: '',
    code: '',
    name: '',
    language: 'fi',
  })

  const runQuery = debounce(async (params) => {
    const { data } = await apiClient.get('/admin/feedback-targets', { params })
    const { feedbackTargets, count } = data

    setPotentialFeedbackTargets(
      feedbackTargets.map((fbt) => ({
        ...fbt,
        opensAt: new Date(fbt.opensAt),
        closesAt: new Date(fbt.closesAt),
        courseRealisation: {
          ...fbt.courseRealisation,
          startDate: new Date(fbt.courseRealisation.startDate),
          endDate: new Date(fbt.courseRealisation.endDate),
        },
      })),
    )
    setCount(count)
  }, 600)

  const handleChange = (values) => {
    const newQuery = { ...query, ...values }
    setQuery(newQuery)
    runQuery(newQuery)
  }

  return (
    <Box mt={4}>
      <Box display="flex" alignItems="center">
        <TextField
          variant="outlined"
          label="id"
          value={query.id}
          onChange={(e) => handleChange({ ...query, id: e.target.value })}
        />
        <Box m={1} />
        <TextField
          variant="outlined"
          label="course code"
          value={query.code}
          onFocus={() => setQuery({ ...query, id: '' })}
          onChange={(e) => handleChange({ ...query, code: e.target.value })}
        />
        <Box m={1} />
        <TextField
          variant="outlined"
          label="CU name"
          value={query.name}
          onFocus={() => setQuery({ ...query, id: '' })}
          onChange={(e) => handleChange({ ...query, name: e.target.value })}
        />
        <Box m={1} />
        <Button
          onClick={() => {
            const newQuery = {
              ...query,
              language: query.language === 'fi' ? 'en' : 'fi',
            }
            setQuery(newQuery)
            if (query.name?.length > 2) {
              runQuery(newQuery)
            }
          }}
        >
          {query.language === 'fi' ? 'finnish' : 'english'}
        </Button>
      </Box>
      <Box m={2} />
      <Typography>
        Showing {potentialFeedbackTargets.length}/{count} results
      </Typography>
      <Box m={2} />
      {potentialFeedbackTargets.map((feedbackTarget) => (
        <Accordion key={feedbackTarget.id}>
          <AccordionSummary>
            <Box display="flex" width="100%">
              <Typography style={{ flexShrink: 0, flexBasis: '15%' }}>
                {feedbackTarget.id}
              </Typography>
              <Box m={2} />
              <Typography style={{ flexShrink: 0, flexBasis: '16%' }}>
                {feedbackTarget.courseUnit.courseCode}
              </Typography>
              <Box m={2} />
              <Typography style={{ flexShrink: 0, flexBasis: '30%' }}>
                {feedbackTarget.courseUnit.name?.fi}
              </Typography>
              <Box m={2} />
              <Typography variant="body2">
                {feedbackTarget.opensAt.toLocaleDateString()} -{' '}
                {feedbackTarget.closesAt.toLocaleDateString()}
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
      ))}
    </Box>
  )
}

export default FeedbackTargetInspector
