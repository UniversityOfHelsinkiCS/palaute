import React from 'react'
import { useTranslation } from 'react-i18next'

import { TableRow, TableCell } from '@material-ui/core'

import { getLanguageValue } from '../../util/languageUtils'

const OrganisationItem = ({ organisation }) => {
  const { i18n } = useTranslation()

  return (
    <TableRow>
      <TableCell>
        {getLanguageValue(organisation.name, i18n.language)}
      </TableCell>
      <TableCell>{organisation.code}</TableCell>
    </TableRow>
  )
}

export default OrganisationItem
