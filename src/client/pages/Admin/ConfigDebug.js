import React from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'

const ConfigDebug = () => {
  // eslint-disable-next-line no-undef
  const entries = Object.entries(CONFIG ?? {})

  return (
    <Box mb={2}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Configuration</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">This is the configuration polyfilled at build time</Typography>
          <TableContainer sx={{ mt: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell>{k}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{Array.isArray(v) ? `[${v.join(', ')}]` : v}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default ConfigDebug
