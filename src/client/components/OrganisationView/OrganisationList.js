import React from 'react'
import { useTranslation } from 'react-i18next'

import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core'

import OrganisationItem from './OrganisationItem'

const OrganisationList = ({ organisations }) => {
  const { t } = useTranslation()

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('organisationView:organisationName')}</TableCell>
            <TableCell>{t('organisationView:organisationCode')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {organisations.map((org) => (
            <OrganisationItem key={org.id} organisation={org} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default OrganisationList
