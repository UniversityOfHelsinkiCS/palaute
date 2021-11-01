import React from 'react'
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
  makeStyles,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import useEmailsToBeSent from '../../hooks/useEmailsToBeSent'

const useStyles = makeStyles(() => ({
  accordion: {
    marginTop: 10,
  },
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
}))

const EmailAccordion = () => {
  const [emailData, getTheEmails] = useEmailsToBeSent()
  const classes = useStyles()

  const {
    emails,
    studentEmails,
    teacherEmails,
    teacherEmailCounts,
    studentEmailCounts,
    tokenPresent,
  } = emailData

  return (
    <Box mb={2} className={classes.accordion}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          onClick={getTheEmails}
        >
          <Typography>Email statistics</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <div className={classes.emailCounts}>
            <Typography className={classes.count}>
              Student emails TODAY: {studentEmails}
            </Typography>
            <Typography className={classes.count}>
              Teacher emails TODAY: {teacherEmails}
            </Typography>
          </div>
          <div className={classes.emailCounts}>
            <div className={classes.container}>
              <Typography>
                Approximate teacher emails this week (~ +5-10%)
              </Typography>
              {teacherEmailCounts.map((row, index) => (
                <Typography key={index}>
                  {row.date}: {row.count}
                </Typography>
              ))}
            </div>
            <div className={classes.container}>
              <Typography>
                Approximate student emails this week (~ +5-10%)
              </Typography>
              {studentEmailCounts.map((row, index) => (
                <Typography key={index}>
                  {row.date}: {row.count}
                </Typography>
              ))}
            </div>
            {tokenPresent && <Typography>token</Typography>}
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
              {emails.map((email) => (
                <TableRow key={email.to}>
                  <TableCell>{email.to}</TableCell>
                  <TableCell>{email.subject}</TableCell>
                  <TableCell>
                    {/* eslint-disable-next-line react/no-danger */}
                    <div dangerouslySetInnerHTML={{ __html: email.text }} />
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
