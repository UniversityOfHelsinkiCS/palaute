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
}))

const EmailAccordion = () => {
  const [emails, getTheEmails] = useEmailsToBeSent()
  const classes = useStyles()

  return (
    <Box mb={2} className={classes.accordion}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          onClick={getTheEmails}
        >
          <Typography>Emails that will be sent today</Typography>
        </AccordionSummary>
        <AccordionDetails>
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
