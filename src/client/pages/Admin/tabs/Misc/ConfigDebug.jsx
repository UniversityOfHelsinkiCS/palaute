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
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../../util/apiClient'

const ConfigDebug = () => {
  // eslint-disable-next-line no-undef
  const entries = Object.entries(CONFIG ?? {})

  const { data, isLoading } = useQuery({
    queryKey: ['NODE_CONFIG_ENV'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/node-config-env')
      return res.data
    },
  })

  return (
    <Box mb={2}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box>Configuration</Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box fontWeight="light">
            <Box display="flex" gap="1rem" mb="2rem">
              Backend config in use:{' '}
              <Typography fontFamily="monospace">{!isLoading && JSON.stringify(data)}</Typography>
            </Box>
            Below is the configuration populated at build time:
          </Box>
          <TableContainer sx={{ mt: 2 }}>
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
                    <TableCell sx={{ fontFamily: 'monospace' }}>{JSON.stringify(v)}</TableCell>
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
