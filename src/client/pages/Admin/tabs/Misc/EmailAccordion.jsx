import React from 'react'
/** @jsxImportSource @emotion/react */

import {
  Box,
  AccordionSummary,
  Accordion,
  AccordionDetails,
  Typography,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import useEmailsToBeSent from '../../../../hooks/useEmailsToBeSent'

const styles = {
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  emailCounts: {
    display: 'flex',
    flexDirection: 'row',
  },
  count: {
    marginRight: 10,
    fontWeight: 'bold',
  },
  container: {
    marginTop: 10,
    marginRight: 20,
  },
}

const EmailAccordion = () => {
  const [emailData, getTheEmails] = useEmailsToBeSent()

  const { emails, studentEmails, teacherEmails, teacherEmailCounts, studentEmailCounts } = emailData

  return (
    <Box mb={2} mt={2}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          onClick={getTheEmails}
        >
          <Typography>Email statistics</Typography>
        </AccordionSummary>
        <AccordionDetails sx={styles.details}>
          <div style={styles.emailCounts}>
            <Typography sx={styles.count}>Student emails TODAY: {studentEmails}</Typography>
            <Typography sx={styles.count}>Teacher emails TODAY: {teacherEmails}</Typography>
          </div>
          <div style={styles.emailCounts}>
            <div style={styles.container}>
              <Typography>Approximate teacher emails this week (~ +5-10%)</Typography>
              {teacherEmailCounts.map((row, index) => (
                <Typography key={index}>
                  {row.date}: {row.count}
                </Typography>
              ))}
            </div>
            <div style={styles.container}>
              <Typography>Approximate student emails this week (~ +5-10%)</Typography>
              {studentEmailCounts.map((row, index) => (
                <Typography key={index}>
                  {row.date}: {row.count}
                </Typography>
              ))}
            </div>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email sent to</TableCell>
                <TableCell>Email subject</TableCell>
                <TableCell>Email text</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emails.map((email, idx) => (
                <TableRow key={`${email.to}${idx}`}>
                  <TableCell>{email.to}</TableCell>
                  <TableCell>{email.subject}</TableCell>
                  <TableCell>
                    {/* eslint-disable-next-line react/no-danger */}
                    <div dangerouslySetInnerHTML={{ __html: email.text }} style={{ whiteSpace: 'pre-line' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default EmailAccordion
